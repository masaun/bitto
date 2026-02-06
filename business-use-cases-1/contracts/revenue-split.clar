(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var split-admin principal tx-sender)

(define-map revenue-splits
    uint
    (list 10 { recipient: principal, share: uint })
)

(define-map pending-revenue
    principal
    uint
)

(define-read-only (get-revenue-split (sale-id uint))
    (map-get? revenue-splits sale-id)
)

(define-read-only (get-pending-revenue (recipient principal))
    (default-to u0 (map-get? pending-revenue recipient))
)

(define-public (set-revenue-split (sale-id uint) (recipients (list 10 { recipient: principal, share: uint })))
    (let
        (
            (total-share (fold + (map get-share recipients) u0))
        )
        (asserts! (is-eq total-share u10000) ERR_INVALID_PARAMS)
        (map-set revenue-splits sale-id recipients)
        (ok true)
    )
)

(define-private (get-share (split { recipient: principal, share: uint }))
    (get share split)
)

(define-public (distribute-revenue (sale-id uint) (total-amount uint))
    (let
        (
            (splits (unwrap! (map-get? revenue-splits sale-id) (err u101)))
        )
        (fold distribute-to-recipient splits (ok total-amount))
    )
)

(define-private (distribute-to-recipient (split { recipient: principal, share: uint }) (result (response uint uint)))
    (match result
        remaining-amount
            (let
                (
                    (amount (/ (* remaining-amount (get share split)) u10000))
                    (current-pending (get-pending-revenue (get recipient split)))
                )
                (map-set pending-revenue (get recipient split) (+ current-pending amount))
                (ok (- remaining-amount amount))
            )
        error (err error)
    )
)

(define-public (claim-revenue)
    (let
        (
            (amount (get-pending-revenue tx-sender))
        )
        (asserts! (> amount u0) ERR_INVALID_PARAMS)
        (map-delete pending-revenue tx-sender)
        (ok amount)
    )
)

(define-public (set-split-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get split-admin)) ERR_UNAUTHORIZED)
        (var-set split-admin new-admin)
        (ok true)
    )
)
