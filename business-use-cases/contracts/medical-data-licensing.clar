(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PARAMS (err u103))
(define-constant ERR_EXPIRED (err u104))

(define-data-var license-admin principal tx-sender)
(define-data-var next-license-id uint u1)

(define-map licenses
    uint
    {
        licensor: principal,
        licensee: principal,
        asset-id: uint,
        license-type: (string-ascii 20),
        price: uint,
        start-block: uint,
        end-block: uint,
        status: (string-ascii 10)
    }
)

(define-map active-licenses
    { asset-id: uint, licensee: principal }
    uint
)

(define-read-only (get-license (license-id uint))
    (map-get? licenses license-id)
)

(define-read-only (is-license-active (license-id uint))
    (match (map-get? licenses license-id)
        license (and
            (is-eq (get status license) "active")
            (<= (get start-block license) stacks-block-height)
            (>= (get end-block license) stacks-block-height)
        )
        false
    )
)

(define-public (create-license (licensee principal) (asset-id uint) (license-type (string-ascii 20)) (price uint) (duration uint))
    (let
        (
            (license-id (var-get next-license-id))
            (end-block (+ stacks-block-height duration))
        )
        (map-set licenses license-id {
            licensor: tx-sender,
            licensee: licensee,
            asset-id: asset-id,
            license-type: license-type,
            price: price,
            start-block: stacks-block-height,
            end-block: end-block,
            status: "pending"
        })
        (var-set next-license-id (+ license-id u1))
        (ok license-id)
    )
)

(define-public (activate-license (license-id uint))
    (let
        (
            (license (unwrap! (map-get? licenses license-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get licensee license) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (is-eq (get status license) "pending") ERR_INVALID_PARAMS)
        (try! (stx-transfer? (get price license) tx-sender (get licensor license)))
        (map-set licenses license-id (merge license { status: "active" }))
        (map-set active-licenses { asset-id: (get asset-id license), licensee: tx-sender } license-id)
        (ok true)
    )
)

(define-public (revoke-license (license-id uint))
    (let
        (
            (license (unwrap! (map-get? licenses license-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get licensor license) tx-sender) ERR_UNAUTHORIZED)
        (map-set licenses license-id (merge license { status: "revoked" }))
        (map-delete active-licenses { asset-id: (get asset-id license), licensee: (get licensee license) })
        (ok true)
    )
)

(define-public (set-license-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get license-admin)) ERR_UNAUTHORIZED)
        (var-set license-admin new-admin)
        (ok true)
    )
)
