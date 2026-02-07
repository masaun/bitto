(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var preprocessing-admin principal tx-sender)
(define-data-var next-preprocessing-id uint u1)

(define-map preprocessing-jobs
    uint
    {
        capture-id: uint,
        processing-type: (string-ascii 32),
        processed-hash: (buff 32),
        processed-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-preprocessing-job (job-id uint))
    (map-get? preprocessing-jobs job-id)
)

(define-public (record-preprocessing (capture-id uint) (processing-type (string-ascii 32)) (processed-hash (buff 32)))
    (let
        (
            (job-id (var-get next-preprocessing-id))
        )
        (map-set preprocessing-jobs job-id {
            capture-id: capture-id,
            processing-type: processing-type,
            processed-hash: processed-hash,
            processed-at: stacks-block-height,
            status: "completed"
        })
        (var-set next-preprocessing-id (+ job-id u1))
        (ok job-id)
    )
)

(define-public (set-preprocessing-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get preprocessing-admin)) ERR_UNAUTHORIZED)
        (var-set preprocessing-admin new-admin)
        (ok true)
    )
)
