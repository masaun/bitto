(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map distributions uint {total-amount: uint, recipients: uint, distributed: bool})
(define-data-var distribution-nonce uint u0)

(define-public (create-distribution (total-amount uint) (recipients uint))
  (let ((dist-id (+ (var-get distribution-nonce) u1)))
    (asserts! (and (> total-amount u0) (> recipients u0)) ERR-INVALID-PARAMETER)
    (map-set distributions dist-id {total-amount: total-amount, recipients: recipients, distributed: false})
    (var-set distribution-nonce dist-id)
    (ok dist-id)))

(define-read-only (get-distribution (dist-id uint))
  (ok (map-get? distributions dist-id)))
