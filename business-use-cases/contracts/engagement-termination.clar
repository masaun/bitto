(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var termination-admin principal tx-sender)
(define-data-var next-termination-id uint u1)

(define-map terminations
    uint
    {
        engagement-id: uint,
        terminated-by: principal,
        reason: (string-ascii 128),
        terminated-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-termination (termination-id uint))
    (map-get? terminations termination-id)
)

(define-public (terminate-engagement (engagement-id uint) (reason (string-ascii 128)))
    (let
        (
            (termination-id (var-get next-termination-id))
        )
        (map-set terminations termination-id {
            engagement-id: engagement-id,
            terminated-by: tx-sender,
            reason: reason,
            terminated-at: stacks-block-height,
            status: "terminated"
        })
        (var-set next-termination-id (+ termination-id u1))
        (ok termination-id)
    )
)

(define-public (suspend-engagement (engagement-id uint) (reason (string-ascii 128)))
    (let
        (
            (termination-id (var-get next-termination-id))
        )
        (map-set terminations termination-id {
            engagement-id: engagement-id,
            terminated-by: tx-sender,
            reason: reason,
            terminated-at: stacks-block-height,
            status: "suspended"
        })
        (var-set next-termination-id (+ termination-id u1))
        (ok termination-id)
    )
)

(define-public (set-termination-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get termination-admin)) ERR_UNAUTHORIZED)
        (var-set termination-admin new-admin)
        (ok true)
    )
)
