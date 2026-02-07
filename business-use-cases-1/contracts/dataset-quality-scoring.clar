(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var scoring-admin principal tx-sender)

(define-map dataset-quality
    uint
    {
        resolution-score: uint,
        coverage-score: uint,
        diversity-score: uint,
        overall-score: uint,
        scored-at: uint
    }
)

(define-read-only (get-quality-score (dataset-id uint))
    (map-get? dataset-quality dataset-id)
)

(define-public (set-quality-score (dataset-id uint) (resolution uint) (coverage uint) (diversity uint))
    (let
        (
            (overall (/ (+ (+ resolution coverage) diversity) u3))
        )
        (map-set dataset-quality dataset-id {
            resolution-score: resolution,
            coverage-score: coverage,
            diversity-score: diversity,
            overall-score: overall,
            scored-at: stacks-block-height
        })
        (ok true)
    )
)

(define-public (set-scoring-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get scoring-admin)) ERR_UNAUTHORIZED)
        (var-set scoring-admin new-admin)
        (ok true)
    )
)
