(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map compliance-risks principal {score: uint, violations: uint, remediated: uint})

(define-public (set-compliance-risk (score uint) (violations uint) (remediated uint))
  (begin
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (ok (map-set compliance-risks tx-sender {score: score, violations: violations, remediated: remediated}))))

(define-read-only (get-compliance-risk (entity principal))
  (ok (map-get? compliance-risks entity)))
