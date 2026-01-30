(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PARAMS (err u103))
(define-constant ERR_INSUFFICIENT_BALANCE (err u104))

(define-data-var distribution-admin principal tx-sender)

(define-map royalty-splits
    uint
    (list 20 { recipient: principal, share: uint })
)

(define-map pending-royalties
    principal
    uint
)

(define-read-only (get-royalty-split (asset-id uint))
    (map-get? royalty-splits asset-id)
)

(define-read-only (get-pending-royalties (recipient principal))
    (default-to u0 (map-get? pending-royalties recipient))
)

(define-public (set-royalty-split (asset-id uint) (recipients (list 20 { recipient: principal, share: uint })))
    (let
        (
            (total-share (fold + (map get-share recipients) u0))
        )
        (asserts! (is-eq total-share u10000) ERR_INVALID_PARAMS)
        (map-set royalty-splits asset-id recipients)
        (ok true)
    )
)

(define-private (get-share (split { recipient: principal, share: uint }))
    (get share split)
)

(define-public (distribute-royalties (asset-id uint) (total-amount uint))
    (let
        (
            (splits (unwrap! (map-get? royalty-splits asset-id) ERR_NOT_FOUND))
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
                    (current-pending (get-pending-royalties (get recipient split)))
                )
                (map-set pending-royalties (get recipient split) (+ current-pending amount))
                (ok (- remaining-amount amount))
            )
        error (err error)
    )
)

(define-public (claim-royalties)
    (let
        (
            (amount (get-pending-royalties tx-sender))
        )
        (asserts! (> amount u0) ERR_INVALID_PARAMS)
        (map-delete pending-royalties tx-sender)
        (ok amount)
    )
)

(define-public (set-distribution-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get distribution-admin)) ERR_UNAUTHORIZED)
        (var-set distribution-admin new-admin)
        (ok true)
    )
)
