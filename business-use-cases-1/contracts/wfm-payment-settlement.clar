(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var payment-admin principal tx-sender)

(define-map worker-payments
    principal
    uint
)

(define-read-only (get-pending-payment (worker principal))
    (default-to u0 (map-get? worker-payments worker))
)

(define-public (record-payment (worker principal) (amount uint))
    (let
        (
            (current-pending (get-pending-payment worker))
        )
        (map-set worker-payments worker (+ current-pending amount))
        (ok true)
    )
)

(define-public (claim-payment)
    (let
        (
            (amount (get-pending-payment tx-sender))
        )
        (asserts! (> amount u0) ERR_INVALID_PARAMS)
        (map-delete worker-payments tx-sender)
        (ok amount)
    )
)

(define-public (set-payment-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get payment-admin)) ERR_UNAUTHORIZED)
        (var-set payment-admin new-admin)
        (ok true)
    )
)
