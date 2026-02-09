(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map tax-records {user: principal, period: uint} {gross: uint, tax: uint, reported: bool})

(define-public (record-tax (period uint) (gross uint) (tax uint))
  (begin
    (asserts! (> gross u0) ERR-INVALID-PARAMETER)
    (ok (map-set tax-records {user: tx-sender, period: period} {gross: gross, tax: tax, reported: false}))))

(define-read-only (get-tax-record (user principal) (period uint))
  (ok (map-get? tax-records {user: user, period: period})))
