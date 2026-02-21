(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-invalid-amount (err u103))
(define-constant err-not-available (err u104))

(define-map athletes principal {name: (string-ascii 50), sport: (string-ascii 30), rate: uint, available: bool})
(define-map deals uint {athlete: principal, brand: principal, amount: uint, duration: uint, start-block: uint})
(define-data-var deal-nonce uint u0)
(define-data-var marketplace-fee uint u30)

(define-read-only (get-athlete (athlete principal))
  (map-get? athletes athlete))

(define-read-only (get-deal (deal-id uint))
  (map-get? deals deal-id))

(define-read-only (get-marketplace-fee)
  (ok (var-get marketplace-fee)))

(define-public (register-athlete (name (string-ascii 50)) (sport (string-ascii 30)) (rate uint))
  (begin
    (asserts! (is-none (map-get? athletes tx-sender)) err-already-exists)
    (map-set athletes tx-sender {name: name, sport: sport, rate: rate, available: true})
    (ok true)))

(define-public (create-deal (athlete principal) (amount uint) (duration uint))
  (let ((athlete-data (unwrap! (map-get? athletes athlete) err-not-found))
        (deal-id (+ (var-get deal-nonce) u1)))
    (asserts! (get available athlete-data) err-not-available)
    (asserts! (>= amount (get rate athlete-data)) err-invalid-amount)
    (try! (stx-transfer? amount tx-sender athlete))
    (map-set deals deal-id {athlete: athlete, brand: tx-sender, amount: amount, duration: duration, start-block: burn-block-height})
    (var-set deal-nonce deal-id)
    (ok deal-id)))

(define-public (update-athlete-rate (new-rate uint))
  (let ((athlete-data (unwrap! (map-get? athletes tx-sender) err-not-found)))
    (map-set athletes tx-sender (merge athlete-data {rate: new-rate}))
    (ok true)))

(define-public (toggle-availability)
  (let ((athlete-data (unwrap! (map-get? athletes tx-sender) err-not-found)))
    (map-set athletes tx-sender (merge athlete-data {available: (not (get available athlete-data))}))
    (ok true)))

(define-public (set-marketplace-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set marketplace-fee new-fee)
    (ok true)))
