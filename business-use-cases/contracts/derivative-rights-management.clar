(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var rights-admin principal tx-sender)
(define-data-var next-derivative-id uint u1)

(define-map derivative-datasets
    uint
    {
        source-dataset-id: uint,
        creator: principal,
        derivative-type: (string-ascii 20),
        metadata-uri: (string-ascii 256),
        created-at: uint
    }
)

(define-map derivative-permissions
    { source-dataset-id: uint, creator: principal }
    bool
)

(define-read-only (get-derivative-dataset (derivative-id uint))
    (map-get? derivative-datasets derivative-id)
)

(define-read-only (has-derivative-rights (source-dataset-id uint) (creator principal))
    (default-to false (map-get? derivative-permissions { source-dataset-id: source-dataset-id, creator: creator }))
)

(define-public (grant-derivative-rights (source-dataset-id uint) (creator principal))
    (begin
        (map-set derivative-permissions { source-dataset-id: source-dataset-id, creator: creator } true)
        (ok true)
    )
)

(define-public (register-derivative-dataset (source-dataset-id uint) (derivative-type (string-ascii 20)) (metadata-uri (string-ascii 256)))
    (let
        (
            (derivative-id (var-get next-derivative-id))
        )
        (asserts! (has-derivative-rights source-dataset-id tx-sender) ERR_UNAUTHORIZED)
        (map-set derivative-datasets derivative-id {
            source-dataset-id: source-dataset-id,
            creator: tx-sender,
            derivative-type: derivative-type,
            metadata-uri: metadata-uri,
            created-at: stacks-block-height
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
