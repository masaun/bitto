(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NON_COMPLIANT (err u101))

(define-data-var compliance-admin principal tx-sender)

(define-map buyer-compliance
    principal
    {
        verified: bool,
        verified-at: uint,
        expires-at: uint,
        jurisdiction: (string-ascii 32)
    }
)

(define-read-only (get-buyer-compliance (buyer principal))
    (map-get? buyer-compliance buyer)
)

(define-read-only (is-buyer-compliant (buyer principal))
    (match (map-get? buyer-compliance buyer)
        compliance (and
            (get verified compliance)
            (>= (get expires-at compliance) stacks-block-height)
        )
        false
    )
)

(define-public (certify-buyer (buyer principal) (jurisdiction (string-ascii 32)) (duration uint))
    (begin
        (asserts! (is-eq tx-sender (var-get compliance-admin)) ERR_UNAUTHORIZED)
        (map-set buyer-compliance buyer {
            verified: true,
            verified-at: stacks-block-height,
            expires-at: (+ stacks-block-height duration),
            jurisdiction: jurisdiction
        })
        (ok true)
    )
)

(define-public (revoke-buyer-compliance (buyer principal))
    (begin
        (asserts! (is-eq tx-sender (var-get compliance-admin)) ERR_UNAUTHORIZED)
        (map-delete buyer-compliance buyer)
        (ok true)
    )
)

(define-public (verify-buyer (buyer principal))
    (begin
        (asserts! (is-buyer-compliant buyer) ERR_NON_COMPLIANT)
        (ok true)
    )
)

(define-public (set-compliance-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get compliance-admin)) ERR_UNAUTHORIZED)
        (var-set compliance-admin new-admin)
        (ok true)
    )
)
