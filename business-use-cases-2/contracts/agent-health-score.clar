(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map health-scores principal {score: uint, components-passing: uint, total-components: uint})

(define-public (set-health-score (score uint) (components-passing uint) (total-components uint))
  (begin
    (asserts! (and (<= score u100) (<= components-passing total-components)) ERR-INVALID-PARAMETER)
    (ok (map-set health-scores tx-sender {score: score, components-passing: components-passing, total-components: total-components}))))

(define-read-only (get-health-score (agent principal))
  (ok (map-get? health-scores agent)))
