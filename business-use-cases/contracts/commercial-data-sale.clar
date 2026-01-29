(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var sale-admin principal tx-sender)
(define-data-var next-sale-id uint u1)

(define-map data-sales
    uint
    {
        dataset-id: uint,
        seller: principal,
        buyer: principal,
        price: uint,
        sold-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-data-sale (sale-id uint))
    (map-get? data-sales sale-id)
)

(define-public (execute-sale (dataset-id uint) (buyer principal) (price uint))
    (let
        (
            (sale-id (var-get next-sale-id))
        )
        (try! (stx-transfer? price buyer tx-sender))
        (map-set data-sales sale-id {
            dataset-id: dataset-id,
            seller: tx-sender,
            buyer: buyer,
            price: price,
            sold-at: stacks-block-height,
            status: "completed"
        })
        (var-set next-sale-id (+ sale-id u1))
        (ok sale-id)
    )
)

(define-public (set-sale-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get sale-admin)) ERR_UNAUTHORIZED)
        (var-set sale-admin new-admin)
        (ok true)
    )
)
