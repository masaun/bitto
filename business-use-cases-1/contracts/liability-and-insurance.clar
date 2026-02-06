(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var insurance-admin principal tx-sender)
(define-data-var next-policy-id uint u1)

(define-map insurance-policies
    uint
    {
        firm-id: uint,
        coverage-amount: uint,
        premium: uint,
        start-block: uint,
        end-block: uint,
        status: (string-ascii 10)
    }
)

(define-map claims
    uint
    {
        policy-id: uint,
        claim-amount: uint,
        claimed-by: principal,
        claimed-at: uint,
        status: (string-ascii 10)
    }
)

(define-data-var next-claim-id uint u1)

(define-read-only (get-policy (policy-id uint))
    (map-get? insurance-policies policy-id)
)

(define-read-only (get-claim (claim-id uint))
    (map-get? claims claim-id)
)

(define-public (create-policy (firm-id uint) (coverage-amount uint) (premium uint) (duration uint))
    (let
        (
            (policy-id (var-get next-policy-id))
            (end-block (+ stacks-block-height duration))
        )
        (map-set insurance-policies policy-id {
            firm-id: firm-id,
            coverage-amount: coverage-amount,
            premium: premium,
            start-block: stacks-block-height,
            end-block: end-block,
            status: "active"
        })
        (var-set next-policy-id (+ policy-id u1))
        (ok policy-id)
    )
)

(define-public (file-claim (policy-id uint) (claim-amount uint))
    (let
        (
            (claim-id (var-get next-claim-id))
        )
        (map-set claims claim-id {
            policy-id: policy-id,
            claim-amount: claim-amount,
            claimed-by: tx-sender,
            claimed-at: stacks-block-height,
            status: "pending"
        })
        (var-set next-claim-id (+ claim-id u1))
        (ok claim-id)
    )
)

(define-public (set-insurance-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get insurance-admin)) ERR_UNAUTHORIZED)
        (var-set insurance-admin new-admin)
        (ok true)
    )
)
