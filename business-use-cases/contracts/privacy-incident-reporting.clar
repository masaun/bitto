(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var incident-admin principal tx-sender)
(define-data-var next-incident-id uint u1)

(define-map privacy-incidents
    uint
    {
        dataset-id: uint,
        incident-type: (string-ascii 64),
        reported-by: principal,
        reported-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-privacy-incident (incident-id uint))
    (map-get? privacy-incidents incident-id)
)

(define-public (report-incident (dataset-id uint) (incident-type (string-ascii 64)))
    (let
        (
            (incident-id (var-get next-incident-id))
        )
        (map-set privacy-incidents incident-id {
            dataset-id: dataset-id,
            incident-type: incident-type,
            reported-by: tx-sender,
            reported-at: stacks-block-height,
            status: "reported"
        })
        (var-set next-incident-id (+ incident-id u1))
        (ok incident-id)
    )
)

(define-public (resolve-incident (incident-id uint))
    (let
        (
            (incident (unwrap! (map-get? privacy-incidents incident-id) (err u101)))
        )
        (asserts! (is-eq tx-sender (var-get incident-admin)) ERR_UNAUTHORIZED)
        (map-set privacy-incidents incident-id (merge incident { status: "resolved" }))
        (ok true)
    )
)

(define-public (set-incident-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get incident-admin)) ERR_UNAUTHORIZED)
        (var-set incident-admin new-admin)
        (ok true)
    )
)
