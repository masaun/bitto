(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var nft-admin principal tx-sender)
(define-data-var next-token-id uint u1)

(define-non-fungible-token ai-model-ip uint)

(define-map token-metadata
    uint
    {
        model-uri: (string-ascii 256),
        training-data-hash: (buff 32),
        created-at: uint,
        royalty-percentage: uint
    }
)

(define-map token-royalties
    uint
    { recipient: principal, percentage: uint }
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? ai-model-ip token-id))
)

(define-read-only (get-token-metadata (token-id uint))
    (map-get? token-metadata token-id)
)

(define-read-only (get-token-royalty (token-id uint))
    (map-get? token-royalties token-id)
)

(define-public (mint-ip-nft (model-uri (string-ascii 256)) (training-data-hash (buff 32)) (royalty-percentage uint))
    (let
        (
            (token-id (var-get next-token-id))
        )
        (asserts! (<= royalty-percentage u10000) ERR_INVALID_PARAMS)
        (try! (nft-mint? ai-model-ip token-id tx-sender))
        (map-set token-metadata token-id {
            model-uri: model-uri,
            training-data-hash: training-data-hash,
            created-at: stacks-block-height,
            royalty-percentage: royalty-percentage
        })
        (map-set token-royalties token-id { recipient: tx-sender, percentage: royalty-percentage })
        (var-set next-token-id (+ token-id u1))
        (ok token-id)
    )
)

(define-public (transfer-nft (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
        (try! (nft-transfer? ai-model-ip token-id sender recipient))
        (ok true)
    )
)

(define-public (update-royalty-recipient (token-id uint) (new-recipient principal))
    (let
        (
            (owner (unwrap! (nft-get-owner? ai-model-ip token-id) ERR_NOT_FOUND))
            (royalty (unwrap! (map-get? token-royalties token-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
        (map-set token-royalties token-id (merge royalty { recipient: new-recipient }))
        (ok true)
    )
)

(define-public (set-nft-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get nft-admin)) ERR_UNAUTHORIZED)
        (var-set nft-admin new-admin)
        (ok true)
    )
)
