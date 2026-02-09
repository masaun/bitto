(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map governance-scores principal {participation: uint, proposal-quality: uint, overall: uint})

(define-public (set-governance-score (participation uint) (proposal-quality uint) (overall uint))
  (begin
    (asserts! (and (<= participation u100) (<= proposal-quality u100) (<= overall u100)) ERR-INVALID-PARAMETER)
    (ok (map-set governance-scores tx-sender {participation: participation, proposal-quality: proposal-quality, overall: overall}))))

(define-read-only (get-governance-score (member principal))
  (ok (map-get? governance-scores member)))
