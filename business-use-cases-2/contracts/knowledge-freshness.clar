(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map freshness-scores uint {kb-id: uint, last-updated: uint, freshness-score: uint})

(define-public (update-freshness (kb-id uint) (freshness-score uint))
  (begin
    (asserts! (<= freshness-score u100) ERR-INVALID-PARAMETER)
    (ok (map-set freshness-scores kb-id {kb-id: kb-id, last-updated: stacks-block-height, freshness-score: freshness-score}))))

(define-read-only (get-freshness (kb-id uint))
  (ok (map-get? freshness-scores kb-id)))
