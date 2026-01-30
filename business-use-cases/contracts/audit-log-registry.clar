(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var audit-admin principal tx-sender)
(define-data-var next-log-id uint u1)

(define-map audit-logs
    uint
    {
        dataset-id: uint,
        action: (string-ascii 64),
        actor: principal,
        timestamp: uint,
        details-hash: (buff 32)
    }
)

(define-read-only (get-audit-log (log-id uint))
    (map-get? audit-logs log-id)
)

(define-public (log-action (dataset-id uint) (action (string-ascii 64)) (details-hash (buff 32)))
    (let
        (
            (log-id (var-get next-log-id))
        )
        (map-set audit-logs log-id {
            dataset-id: dataset-id,
            action: action,
            actor: tx-sender,
            timestamp: stacks-block-height,
            details-hash: details-hash
        })
        (var-set next-log-id (+ log-id u1))
        (ok log-id)
    )
)

(define-public (set-audit-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get audit-admin)) ERR_UNAUTHORIZED)
        (var-set audit-admin new-admin)
        (ok true)
    )
)
