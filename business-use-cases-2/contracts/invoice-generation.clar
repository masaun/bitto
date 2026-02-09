(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map invoices uint {recipient: principal, amount: uint, period: uint, paid: bool})
(define-data-var invoice-nonce uint u0)

(define-public (generate-invoice (recipient principal) (amount uint) (period uint))
  (let ((invoice-id (+ (var-get invoice-nonce) u1)))
    (asserts! (> amount u0) ERR-INVALID-PARAMETER)
    (map-set invoices invoice-id {recipient: recipient, amount: amount, period: period, paid: false})
    (var-set invoice-nonce invoice-id)
    (ok invoice-id)))

(define-read-only (get-invoice (invoice-id uint))
  (ok (map-get? invoices invoice-id)))
