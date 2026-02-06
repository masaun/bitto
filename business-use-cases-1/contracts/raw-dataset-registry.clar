(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var registry-admin principal tx-sender)
(define-data-var next-dataset-id uint u1)

(define-map raw-datasets
    uint
    {
        vehicle-id: uint,
        data-hash: (buff 32),
        metadata-uri: (string-ascii 256),
        captured-at: uint,
        owner: principal
    }
)

(define-read-only (get-raw-dataset (dataset-id uint))
    (map-get? raw-datasets dataset-id)
)

(define-public (register-raw-dataset (vehicle-id uint) (data-hash (buff 32)) (metadata-uri (string-ascii 256)))
    (let
        (
            (dataset-id (var-get next-dataset-id))
        )
        (map-set raw-datasets dataset-id {
            vehicle-id: vehicle-id,
            data-hash: data-hash,
            metadata-uri: metadata-uri,
            captured-at: stacks-block-height,
            owner: tx-sender
        })
        (var-set next-dataset-id (+ dataset-id u1))
        (ok dataset-id)
    )
)

(define-public (set-registry-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get registry-admin)) ERR_UNAUTHORIZED)
        (var-set registry-admin new-admin)
        (ok true)
    )
)
