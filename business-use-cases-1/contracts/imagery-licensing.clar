(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var license-admin principal tx-sender)
(define-data-var next-license-id uint u1)

(define-map imagery-licenses
    uint
    {
        licensor: principal,
        licensee: principal,
        dataset-id: uint,
        price: uint,
        start-block: uint,
        end-block: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-imagery-license (license-id uint))
    (map-get? imagery-licenses license-id)
)

(define-read-only (is-license-active (license-id uint))
    (match (map-get? imagery-licenses license-id)
        license (and
            (is-eq (get status license) "active")
            (<= (get start-block license) stacks-block-height)
            (>= (get end-block license) stacks-block-height)
        )
        false
    )
)

(define-public (create-imagery-license (licensee principal) (dataset-id uint) (price uint) (duration uint))
    (let
        (
            (license-id (var-get next-license-id))
            (end-block (+ stacks-block-height duration))
        )
        (map-set imagery-licenses license-id {
            licensor: tx-sender,
            licensee: licensee,
            dataset-id: dataset-id,
            price: price,
            start-block: stacks-block-height,
            end-block: end-block,
            status: "pending"
        })
        (var-set next-license-id (+ license-id u1))
        (ok license-id)
    )
)

(define-public (activate-imagery-license (license-id uint))
    (let
        (
            (license (unwrap! (map-get? imagery-licenses license-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get licensee license) tx-sender) ERR_UNAUTHORIZED)
        (try! (stx-transfer? (get price license) tx-sender (get licensor license)))
        (map-set imagery-licenses license-id (merge license { status: "active" }))
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
