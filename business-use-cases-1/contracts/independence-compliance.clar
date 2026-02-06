(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_CONFLICT_OF_INTEREST (err u101))

(define-data-var compliance-admin principal tx-sender)

(define-map independence-rules
    { auditor: principal, client: principal }
    {
        has-conflict: bool,
        checked-at: uint,
        expires-at: uint
    }
)

(define-read-only (get-independence-status (auditor principal) (client principal))
    (map-get? independence-rules { auditor: auditor, client: client })
)

(define-read-only (is-independent (auditor principal) (client principal))
    (match (map-get? independence-rules { auditor: auditor, client: client })
        rule (and
            (not (get has-conflict rule))
            (>= (get expires-at rule) stacks-block-height)
        )
        true
    )
)

(define-public (certify-independence (auditor principal) (client principal) (duration uint))
    (begin
        (asserts! (is-eq tx-sender (var-get compliance-admin)) ERR_UNAUTHORIZED)
        (map-set independence-rules
            { auditor: auditor, client: client }
            {
                has-conflict: false,
                checked-at: stacks-block-height,
                expires-at: (+ stacks-block-height duration)
            }
        )
        (ok true)
    )
)

(define-public (flag-conflict (auditor principal) (client principal))
    (begin
        (asserts! (is-eq tx-sender (var-get compliance-admin)) ERR_UNAUTHORIZED)
        (map-set independence-rules
            { auditor: auditor, client: client }
            {
                has-conflict: true,
                checked-at: stacks-block-height,
                expires-at: u0
            }
        )
        (ok true)
    )
)

(define-public (verify-independence (auditor principal) (client principal))
    (begin
        (asserts! (is-independent auditor client) ERR_CONFLICT_OF_INTEREST)
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
