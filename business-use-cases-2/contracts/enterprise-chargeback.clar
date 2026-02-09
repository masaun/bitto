(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map chargeback-records uint {tenant: principal, amount: uint, period: uint, paid: bool})
(define-data-var chargeback-nonce uint u0)

(define-public (create-chargeback (tenant principal) (amount uint) (period uint))
  (let ((cb-id (+ (var-get chargeback-nonce) u1)))
    (asserts! (> amount u0) ERR-INVALID-PARAMETER)
    (map-set chargeback-records cb-id {tenant: tenant, amount: amount, period: period, paid: false})
    (var-set chargeback-nonce cb-id)
    (ok cb-id)))

(define-read-only (get-chargeback (cb-id uint))
  (ok (map-get? chargeback-records cb-id)))
