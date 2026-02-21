(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-settled (err u102))
(define-constant err-invalid-amount (err u103))

(define-map disputes uint {parties: (string-ascii 100), description: (string-ascii 100), amount: uint, settled: bool})
(define-map settlements {dispute-id: uint} {decision: (string-ascii 100), winner: principal, timestamp: uint})
(define-data-var dispute-nonce uint u0)
(define-data-var arbitration-fee uint u500)

(define-read-only (get-dispute (dispute-id uint))
  (map-get? disputes dispute-id))

(define-read-only (get-settlement (dispute-id uint))
  (map-get? settlements {dispute-id: dispute-id}))

(define-read-only (get-arbitration-fee)
  (ok (var-get arbitration-fee)))

(define-public (file-dispute (parties (string-ascii 100)) (description (string-ascii 100)) (amount uint))
  (let ((dispute-id (+ (var-get dispute-nonce) u1)))
    (try! (stx-transfer? (var-get arbitration-fee) tx-sender contract-owner))
    (map-set disputes dispute-id {parties: parties, description: description, amount: amount, settled: false})
    (var-set dispute-nonce dispute-id)
    (ok dispute-id)))

(define-public (settle-dispute (dispute-id uint) (decision (string-ascii 100)) (winner principal))
  (let ((dispute (unwrap! (map-get? disputes dispute-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (get settled dispute)) err-already-settled)
    (map-set disputes dispute-id (merge dispute {settled: true}))
    (map-set settlements {dispute-id: dispute-id} {decision: decision, winner: winner, timestamp: burn-block-height})
    (ok true)))

(define-public (update-arbitration-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set arbitration-fee new-fee)
    (ok true)))
