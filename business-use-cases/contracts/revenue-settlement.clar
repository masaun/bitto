(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var settlement-admin principal tx-sender)

(define-map revenue-shares
    uint
    (list 20 { recipient: principal, share: uint })
)

(define-map pending-settlements
    principal
    uint
)

(define-read-only (get-revenue-share (sale-id uint))
    (map-get? revenue-shares sale-id)
)

(define-read-only (get-pending-settlement (recipient principal))
    (default-to u0 (map-get? pending-settlements recipient))
)

(define-public (set-revenue-share (sale-id uint) (recipients (list 20 { recipient: principal, share: uint })))
    (let
        (
            (total-share (fold + (map get-share recipients) u0))
        )
        (asserts! (is-eq total-share u10000) ERR_INVALID_PARAMS)
        (map-set revenue-shares sale-id recipients)
        (ok true)
    )
)

(define-private (get-share (split { recipient: principal, share: uint }))
    (get share split)
)

(define-public (settle-revenue (sale-id uint) (total-amount uint))
    (let
        (
            (shares (unwrap! (map-get? revenue-shares sale-id) ERR_NOT_FOUND))
        )
        (fold settle-to-recipient shares (ok total-amount))
    )
)

(define-private (settle-to-recipient (split { recipient: principal, share: uint }) (result (response uint uint)))
    (match result
        remaining-amount
            (let
                (
                    (amount (/ (* remaining-amount (get share split)) u10000))
                    (current-pending (get-pending-settlement (get recipient split)))
                )
                (map-set pending-settlements (get recipient split) (+ current-pending amount))
                (ok (- remaining-amount amount))
            )
        error (err error)
    )
)

(define-public (claim-settlement)
    (let
        (
            (amount (get-pending-settlement tx-sender))
        )
        (asserts! (> amount u0) ERR_INVALID_PARAMS)
        (map-delete pending-settlements tx-sender)
        (ok amount)
    )
)

(define-public (set-settlement-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get settlement-admin)) ERR_UNAUTHORIZED)
        (var-set settlement-admin new-admin)
        (ok true)
    )
)
