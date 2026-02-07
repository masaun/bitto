(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var oracle-admin principal tx-sender)
(define-data-var next-oracle-id uint u1)

(define-map oracle-data
    uint
    {
        data-source: (string-ascii 64),
        data-hash: (buff 32),
        submitted-by: principal,
        submitted-at: uint,
        verified: bool
    }
)

(define-read-only (get-oracle-data (oracle-id uint))
    (map-get? oracle-data oracle-id)
)

(define-public (submit-oracle-data (data-source (string-ascii 64)) (data-hash (buff 32)))
    (let
        (
            (oracle-id (var-get next-oracle-id))
        )
        (map-set oracle-data oracle-id {
            data-source: data-source,
            data-hash: data-hash,
            submitted-by: tx-sender,
            submitted-at: stacks-block-height,
            verified: false
        })
        (var-set next-oracle-id (+ oracle-id u1))
        (ok oracle-id)
    )
)

(define-public (verify-oracle-data (oracle-id uint))
    (let
        (
            (data (unwrap! (map-get? oracle-data oracle-id) (err u101)))
        )
        (asserts! (is-eq tx-sender (var-get oracle-admin)) ERR_UNAUTHORIZED)
        (map-set oracle-data oracle-id (merge data { verified: true }))
        (ok true)
    )
)

(define-public (set-oracle-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get oracle-admin)) ERR_UNAUTHORIZED)
        (var-set oracle-admin new-admin)
        (ok true)
    )
)
