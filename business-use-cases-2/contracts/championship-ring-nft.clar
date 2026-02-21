(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-minted (err u102))
(define-constant err-invalid-amount (err u103))

(define-map rings uint {event: (string-ascii 50), champion: (string-ascii 40), year: uint, token-uri: (string-ascii 100), minted: bool})
(define-map ownership {ring-id: uint} {owner: principal, acquired: uint})
(define-data-var ring-nonce uint u0)
(define-data-var mint-price uint u1000)

(define-read-only (get-ring (ring-id uint))
  (map-get? rings ring-id))

(define-read-only (get-ring-owner (ring-id uint))
  (map-get? ownership {ring-id: ring-id}))

(define-read-only (get-mint-price)
  (ok (var-get mint-price)))

(define-public (create-ring (event (string-ascii 50)) (champion (string-ascii 40)) (year uint) (token-uri (string-ascii 100)))
  (let ((ring-id (+ (var-get ring-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set rings ring-id {event: event, champion: champion, year: year, token-uri: token-uri, minted: false})
    (var-set ring-nonce ring-id)
    (ok ring-id)))

(define-public (mint-ring (ring-id uint))
  (let ((ring (unwrap! (map-get? rings ring-id) err-not-found)))
    (asserts! (not (get minted ring)) err-already-minted)
    (try! (stx-transfer? (var-get mint-price) tx-sender contract-owner))
    (map-set rings ring-id (merge ring {minted: true}))
    (map-set ownership {ring-id: ring-id} {owner: tx-sender, acquired: burn-block-height})
    (ok true)))

(define-public (transfer-ring (ring-id uint) (recipient principal))
  (let ((owner-data (unwrap! (map-get? ownership {ring-id: ring-id}) err-not-found)))
    (asserts! (is-eq (get owner owner-data) tx-sender) err-owner-only)
    (map-set ownership {ring-id: ring-id} {owner: recipient, acquired: burn-block-height})
    (ok true)))

(define-public (update-mint-price (new-price uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set mint-price new-price)
    (ok true)))
