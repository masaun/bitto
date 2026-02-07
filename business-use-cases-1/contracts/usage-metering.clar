(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var metering-admin principal tx-sender)

(define-map usage-records
    { resource-id: uint, user: principal, block-height: uint }
    {
        usage-type: (string-ascii 20),
        quantity: uint,
        cost: uint
    }
)

(define-map total-usage
    { resource-id: uint, user: principal }
    {
        total-views: uint,
        total-downloads: uint,
        total-api-calls: uint,
        total-cost: uint
    }
)

(define-read-only (get-usage-record (resource-id uint) (user principal) (height uint))
    (map-get? usage-records { resource-id: resource-id, user: user, block-height: height })
)

(define-read-only (get-total-usage (resource-id uint) (user principal))
    (default-to
        { total-views: u0, total-downloads: u0, total-api-calls: u0, total-cost: u0 }
        (map-get? total-usage { resource-id: resource-id, user: user })
    )
)

(define-public (record-usage (resource-id uint) (usage-type (string-ascii 20)) (quantity uint) (cost uint))
    (let
        (
            (current-total (get-total-usage resource-id tx-sender))
        )
        (map-set usage-records
            { resource-id: resource-id, user: tx-sender, block-height: stacks-block-height }
            { usage-type: usage-type, quantity: quantity, cost: cost }
        )
        (map-set total-usage
            { resource-id: resource-id, user: tx-sender }
            {
                total-views: (if (is-eq usage-type "view")
                    (+ (get total-views current-total) quantity)
                    (get total-views current-total)),
                total-downloads: (if (is-eq usage-type "download")
                    (+ (get total-downloads current-total) quantity)
                    (get total-downloads current-total)),
                total-api-calls: (if (is-eq usage-type "api")
                    (+ (get total-api-calls current-total) quantity)
                    (get total-api-calls current-total)),
                total-cost: (+ (get total-cost current-total) cost)
            }
        )
        (ok true)
    )
)

(define-public (set-metering-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get metering-admin)) ERR_UNAUTHORIZED)
        (var-set metering-admin new-admin)
        (ok true)
    )
)
