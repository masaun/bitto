(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map validation-results uint {data-id: uint, validator: principal, passed: bool, score: uint})
(define-data-var validation-nonce uint u0)

(define-public (validate-data (data-id uint) (passed bool) (score uint))
  (let ((val-id (+ (var-get validation-nonce) u1)))
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (map-set validation-results val-id {data-id: data-id, validator: tx-sender, passed: passed, score: score})
    (var-set validation-nonce val-id)
    (ok val-id)))

(define-read-only (get-validation (val-id uint))
  (ok (map-get? validation-results val-id)))
