(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-licensed (err u102))
(define-constant err-invalid-amount (err u103))

(define-map ceremonies uint {event-name: (string-ascii 50), date: uint, license-fee: uint, licensed: bool})
(define-map licenses {ceremony-id: uint, licensee: principal} {expiry: uint, paid: uint})
(define-data-var ceremony-nonce uint u0)
(define-data-var license-revenue uint u0)

(define-read-only (get-ceremony (ceremony-id uint))
  (map-get? ceremonies ceremony-id))

(define-read-only (get-license (ceremony-id uint) (licensee principal))
  (map-get? licenses {ceremony-id: ceremony-id, licensee: licensee}))

(define-read-only (get-license-revenue)
  (ok (var-get license-revenue)))

(define-public (register-ceremony (event-name (string-ascii 50)) (date uint) (license-fee uint))
  (let ((ceremony-id (+ (var-get ceremony-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set ceremonies ceremony-id {event-name: event-name, date: date, license-fee: license-fee, licensed: false})
    (var-set ceremony-nonce ceremony-id)
    (ok ceremony-id)))

(define-public (purchase-license (ceremony-id uint) (duration uint))
  (let ((ceremony (unwrap! (map-get? ceremonies ceremony-id) err-not-found)))
    (try! (stx-transfer? (get license-fee ceremony) tx-sender contract-owner))
    (map-set licenses {ceremony-id: ceremony-id, licensee: tx-sender} {expiry: (+ burn-block-height duration), paid: (get license-fee ceremony)})
    (map-set ceremonies ceremony-id (merge ceremony {licensed: true}))
    (var-set license-revenue (+ (var-get license-revenue) (get license-fee ceremony)))
    (ok true)))

(define-public (update-license-fee (ceremony-id uint) (new-fee uint))
  (let ((ceremony (unwrap! (map-get? ceremonies ceremony-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set ceremonies ceremony-id (merge ceremony {license-fee: new-fee}))
    (ok true)))

(define-public (withdraw-revenue (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= amount (var-get license-revenue)) err-invalid-amount)
    (var-set license-revenue (- (var-get license-revenue) amount))
    (ok true)))
