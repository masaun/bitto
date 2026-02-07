(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var license-admin principal tx-sender)
(define-data-var next-license-id uint u1)

(define-map inference-licenses
    uint
    {
        model-id: uint,
        licensee: principal,
        price: uint,
        granted-at: uint,
        expires-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-inference-license (license-id uint))
    (map-get? inference-licenses license-id)
)

(define-public (grant-inference-license (model-id uint) (licensee principal) (price uint) (duration uint))
    (let
        (
            (license-id (var-get next-license-id))
        )
        (map-set inference-licenses license-id {
            model-id: model-id,
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
