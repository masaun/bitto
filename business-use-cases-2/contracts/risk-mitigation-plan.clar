(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map mitigation-plans uint {risk-id: uint, strategy: (string-ascii 256), implemented: bool, effective: bool})
(define-data-var mitigation-nonce uint u0)

(define-public (create-mitigation-plan (risk-id uint) (strategy (string-ascii 256)))
  (let ((plan-id (+ (var-get mitigation-nonce) u1)))
    (map-set mitigation-plans plan-id {risk-id: risk-id, strategy: strategy, implemented: false, effective: false})
    (var-set mitigation-nonce plan-id)
    (ok plan-id)))

(define-read-only (get-mitigation-plan (plan-id uint))
  (ok (map-get? mitigation-plans plan-id)))
