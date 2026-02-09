(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map quality-scores uint {data-id: uint, completeness: uint, accuracy: uint, consistency: uint})

(define-public (set-quality-score (data-id uint) (completeness uint) (accuracy uint) (consistency uint))
  (begin
    (asserts! (and (<= completeness u100) (<= accuracy u100) (<= consistency u100)) ERR-INVALID-PARAMETER)
    (ok (map-set quality-scores data-id {data-id: data-id, completeness: completeness, accuracy: accuracy, consistency: consistency}))))

(define-read-only (get-quality-score (data-id uint))
  (ok (map-get? quality-scores data-id)))
