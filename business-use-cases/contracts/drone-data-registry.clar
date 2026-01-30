(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var registry-admin principal tx-sender)
(define-data-var next-dataset-id uint u1)

(define-map datasets
    uint
    {
        owner: principal,
        metadata-uri: (string-ascii 256),
        location-hash: (buff 32),
        captured-at: uint,
        status: (string-ascii 10)
    }
)

(define-map dataset-ownership
    { dataset-id: uint, owner: principal }
    bool
)

(define-read-only (get-dataset (dataset-id uint))
    (map-get? datasets dataset-id)
)

(define-read-only (is-dataset-owner (dataset-id uint) (owner principal))
    (default-to false (map-get? dataset-ownership { dataset-id: dataset-id, owner: owner }))
)

(define-public (register-dataset (metadata-uri (string-ascii 256)) (location-hash (buff 32)))
    (let
        (
            (dataset-id (var-get next-dataset-id))
        )
        (map-set datasets dataset-id {
            owner: tx-sender,
            metadata-uri: metadata-uri,
            location-hash: location-hash,
            captured-at: stacks-block-height,
            status: "active"
        })
        (map-set dataset-ownership { dataset-id: dataset-id, owner: tx-sender } true)
        (var-set next-dataset-id (+ dataset-id u1))
        (ok dataset-id)
    )
)

(define-public (transfer-dataset (dataset-id uint) (new-owner principal))
    (let
        (
            (dataset (unwrap! (map-get? datasets dataset-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get owner dataset) tx-sender) ERR_UNAUTHORIZED)
        (map-delete dataset-ownership { dataset-id: dataset-id, owner: tx-sender })
        (map-set dataset-ownership { dataset-id: dataset-id, owner: new-owner } true)
        (map-set datasets dataset-id (merge dataset { owner: new-owner }))
        (ok true)
    )
)

(define-public (set-registry-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get registry-admin)) ERR_UNAUTHORIZED)
        (var-set registry-admin new-admin)
        (ok true)
    )
)
