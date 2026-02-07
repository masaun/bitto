(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var settlement-admin principal tx-sender)

(define-map audit-fees
    uint
    {
        engagement-id: uint,
        amount: uint,
        paid: bool,
        paid-at: uint
    }
)

(define-read-only (get-audit-fee (fee-id uint))
    (map-get? audit-fees fee-id)
)

(define-data-var next-fee-id uint u1)

(define-public (record-fee (engagement-id uint) (amount uint))
    (let
        (
            (fee-id (var-get next-fee-id))
        )
        (map-set audit-fees fee-id {
            engagement-id: engagement-id,
            amount: amount,
            paid: false,
            paid-at: u0
        })
        (var-set next-fee-id (+ fee-id u1))
        (ok fee-id)
    )
)

(define-public (settle-fee (fee-id uint) (recipient principal))
    (let
        (
            (fee (unwrap! (map-get? audit-fees fee-id) ERR_NOT_FOUND))
        )
        (asserts! (not (get paid fee)) ERR_INVALID_PARAMS)
        (try! (stx-transfer? (get amount fee) tx-sender recipient))
        (map-set audit-fees fee-id (merge fee { paid: true, paid-at: stacks-block-height }))
        (ok true)
    )
)

(define-public (set-settlement-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get settlement-admin)) ERR_UNAUTHORIZED)
        (var-set settlement-admin new-admin)
        (ok true)
    )
)
