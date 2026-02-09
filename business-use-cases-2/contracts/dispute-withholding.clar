(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map withheld-funds uint {dispute-id: uint, amount: uint, released: bool})
(define-data-var withholding-nonce uint u0)

(define-public (withhold-funds (dispute-id uint) (amount uint))
  (let ((withhold-id (+ (var-get withholding-nonce) u1)))
    (asserts! (> amount u0) ERR-INVALID-PARAMETER)
    (map-set withheld-funds withhold-id {dispute-id: dispute-id, amount: amount, released: false})
    (var-set withholding-nonce withhold-id)
    (ok withhold-id)))

(define-read-only (get-withheld (withhold-id uint))
  (ok (map-get? withheld-funds withhold-id)))
