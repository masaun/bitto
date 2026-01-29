(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var dispute-admin principal tx-sender)
(define-data-var next-dispute-id uint u1)

(define-map disputes
    uint
    {
        dataset-id: uint,
        complainant: principal,
        defendant: principal,
        reason: (string-ascii 256),
        filed-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-dispute (dispute-id uint))
    (map-get? disputes dispute-id)
)

(define-public (file-dispute (dataset-id uint) (defendant principal) (reason (string-ascii 256)))
    (let
        (
            (dispute-id (var-get next-dispute-id))
        )
        (map-set disputes dispute-id {
            dataset-id: dataset-id,
            complainant: tx-sender,
            defendant: defendant,
            reason: reason,
            filed-at: stacks-block-height,
            status: "pending"
        })
        (var-set next-dispute-id (+ dispute-id u1))
        (ok dispute-id)
    )
)

(define-public (resolve-dispute (dispute-id uint) (resolution (string-ascii 10)))
    (let
        (
            (dispute (unwrap! (map-get? disputes dispute-id) (err u101)))
        )
        (asserts! (is-eq tx-sender (var-get dispute-admin)) ERR_UNAUTHORIZED)
        (map-set disputes dispute-id (merge dispute { status: resolution }))
        (ok true)
    )
)

(define-public (set-dispute-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get dispute-admin)) ERR_UNAUTHORIZED)
        (var-set dispute-admin new-admin)
        (ok true)
    )
)
