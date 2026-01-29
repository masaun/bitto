(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var license-admin principal tx-sender)
(define-data-var next-license-id uint u1)

(define-map training-licenses
    uint
    {
        dataset-id: uint,
        licensee: principal,
        price: uint,
        granted-at: uint,
        expires-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-training-license (license-id uint))
    (map-get? training-licenses license-id)
)

(define-public (grant-training-license (dataset-id uint) (licensee principal) (price uint) (duration uint))
    (let
        (
            (license-id (var-get next-license-id))
        )
        (map-set training-licenses license-id {
            dataset-id: dataset-id,
            licensee: licensee,
            price: price,
            granted-at: stacks-block-height,
            expires-at: (+ stacks-block-height duration),
            status: "active"
        })
        (var-set next-license-id (+ license-id u1))
        (ok license-id)
    )
)

(define-public (set-license-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get license-admin)) ERR_UNAUTHORIZED)
        (var-set license-admin new-admin)
        (ok true)
    )
)
