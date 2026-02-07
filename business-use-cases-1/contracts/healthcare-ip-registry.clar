(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var registry-admin principal tx-sender)
(define-data-var next-asset-id uint u1)

(define-map assets
    uint
    {
        owner: principal,
        asset-type: (string-ascii 20),
        metadata-uri: (string-ascii 256),
        created-at: uint,
        status: (string-ascii 10)
    }
)

(define-map asset-ownership
    { asset-id: uint, owner: principal }
    bool
)

(define-read-only (get-asset (asset-id uint))
    (map-get? assets asset-id)
)

(define-read-only (get-registry-admin)
    (var-get registry-admin)
)

(define-read-only (is-asset-owner (asset-id uint) (owner principal))
    (default-to false (map-get? asset-ownership { asset-id: asset-id, owner: owner }))
)

(define-public (register-asset (asset-type (string-ascii 20)) (metadata-uri (string-ascii 256)))
    (let
        (
            (asset-id (var-get next-asset-id))
        )
        (map-set assets asset-id {
            owner: tx-sender,
            asset-type: asset-type,
            metadata-uri: metadata-uri,
            created-at: stacks-block-height,
            status: "active"
        })
        (map-set asset-ownership { asset-id: asset-id, owner: tx-sender } true)
        (var-set next-asset-id (+ asset-id u1))
        (ok asset-id)
    )
)

(define-public (transfer-asset (asset-id uint) (new-owner principal))
    (let
        (
            (asset (unwrap! (map-get? assets asset-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get owner asset) tx-sender) ERR_UNAUTHORIZED)
        (map-delete asset-ownership { asset-id: asset-id, owner: tx-sender })
        (map-set asset-ownership { asset-id: asset-id, owner: new-owner } true)
        (map-set assets asset-id (merge asset { owner: new-owner }))
        (ok true)
    )
)

(define-public (update-asset-status (asset-id uint) (new-status (string-ascii 10)))
    (let
        (
            (asset (unwrap! (map-get? assets asset-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get owner asset) tx-sender) ERR_UNAUTHORIZED)
        (map-set assets asset-id (merge asset { status: new-status }))
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
