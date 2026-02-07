(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var rights-admin principal tx-sender)
(define-data-var next-derivative-id uint u1)

(define-map derivative-datasets
    uint
    {
        source-dataset-id: uint,
        derivative-hash: (buff 32),
        creator: principal,
        created-at: uint,
        rights-type: (string-ascii 32)
    }
)

(define-read-only (get-derivative-dataset (derivative-id uint))
    (map-get? derivative-datasets derivative-id)
)

(define-public (register-derivative (source-dataset-id uint) (derivative-hash (buff 32)) (rights-type (string-ascii 32)))
    (let
        (
            (derivative-id (var-get next-derivative-id))
        )
        (map-set derivative-datasets derivative-id {
            source-dataset-id: source-dataset-id,
            derivative-hash: derivative-hash,
            creator: tx-sender,
            created-at: stacks-block-height,
            rights-type: rights-type
        })
        (var-set next-derivative-id (+ derivative-id u1))
        (ok derivative-id)
    )
)

(define-public (set-rights-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get rights-admin)) ERR_UNAUTHORIZED)
        (var-set rights-admin new-admin)
        (ok true)
    )
)
