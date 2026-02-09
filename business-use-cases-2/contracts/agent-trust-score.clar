(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map trust-scores principal {score: uint, interactions: uint, positive-outcomes: uint})

(define-public (update-trust-score (score uint) (interactions uint) (positive-outcomes uint))
  (begin
    (asserts! (and (<= score u100) (<= positive-outcomes interactions)) ERR-INVALID-PARAMETER)
    (ok (map-set trust-scores tx-sender {score: score, interactions: interactions, positive-outcomes: positive-outcomes}))))

(define-read-only (get-trust-score (agent principal))
  (ok (map-get? trust-scores agent)))
