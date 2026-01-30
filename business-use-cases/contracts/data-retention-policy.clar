(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var retention-admin principal tx-sender)

(define-map data-retention-rules
    uint
    {
        retention-period: uint,
        deletion-required-at: uint,
        deleted: bool
    }
)

(define-read-only (get-retention-rule (dataset-id uint))
    (map-get? data-retention-rules dataset-id)
)

(define-public (set-retention-policy (dataset-id uint) (retention-period uint))
    (begin
        (map-set data-retention-rules dataset-id {
            retention-period: retention-period,
            deletion-required-at: (+ stacks-block-height retention-period),
            deleted: false
        })
        (ok true)
    )
)

(define-public (mark-deleted (dataset-id uint))
    (let
        (
            (rule (unwrap! (map-get? data-retention-rules dataset-id) (err u101)))
        )
        (map-set data-retention-rules dataset-id (merge rule { deleted: true }))
        (ok true)
    )
)

(define-public (set-retention-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get retention-admin)) ERR_UNAUTHORIZED)
        (var-set retention-admin new-admin)
        (ok true)
    )
)
