(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var engagement-admin principal tx-sender)
(define-data-var next-engagement-id uint u1)

(define-map engagements
    uint
    {
        firm-id: uint,
        client: principal,
        scope: (string-ascii 256),
        start-block: uint,
        end-block: uint,
        fee: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-engagement (engagement-id uint))
    (map-get? engagements engagement-id)
)

(define-public (create-engagement (firm-id uint) (client principal) (scope (string-ascii 256)) (duration uint) (fee uint))
    (let
        (
            (engagement-id (var-get next-engagement-id))
            (end-block (+ stacks-block-height duration))
        )
        (map-set engagements engagement-id {
            firm-id: firm-id,
            client: client,
            scope: scope,
            start-block: stacks-block-height,
            end-block: end-block,
            fee: fee,
            status: "active"
        })
        (var-set next-engagement-id (+ engagement-id u1))
        (ok engagement-id)
    )
)

(define-public (complete-engagement (engagement-id uint))
    (let
        (
            (engagement (unwrap! (map-get? engagements engagement-id) ERR_NOT_FOUND))
        )
        (map-set engagements engagement-id (merge engagement { status: "completed" }))
        (ok true)
    )
)

(define-public (set-engagement-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get engagement-admin)) ERR_UNAUTHORIZED)
        (var-set engagement-admin new-admin)
        (ok true)
    )
)
