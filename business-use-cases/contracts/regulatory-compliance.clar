(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_NON_COMPLIANT (err u102))

(define-data-var compliance-admin principal tx-sender)

(define-map compliance-rules
    (string-ascii 32)
    {
        rule-hash: (buff 32),
        enforced: bool,
        created-at: uint
    }
)

(define-map entity-compliance
    { entity: principal, rule-id: (string-ascii 32) }
    {
        compliant: bool,
        verified-at: uint,
        expires-at: uint
    }
)

(define-read-only (get-compliance-rule (rule-id (string-ascii 32)))
    (map-get? compliance-rules rule-id)
)

(define-read-only (is-entity-compliant (entity principal) (rule-id (string-ascii 32)))
    (match (map-get? entity-compliance { entity: entity, rule-id: rule-id })
        compliance (and
            (get compliant compliance)
            (>= (get expires-at compliance) stacks-block-height)
        )
        false
    )
)

(define-public (add-compliance-rule (rule-id (string-ascii 32)) (rule-hash (buff 32)))
    (begin
        (asserts! (is-eq tx-sender (var-get compliance-admin)) ERR_UNAUTHORIZED)
        (map-set compliance-rules rule-id {
            rule-hash: rule-hash,
            enforced: true,
            created-at: stacks-block-height
        })
        (ok true)
    )
)

(define-public (certify-compliance (entity principal) (rule-id (string-ascii 32)) (duration uint))
    (let
        (
            (rule (unwrap! (map-get? compliance-rules rule-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get compliance-admin)) ERR_UNAUTHORIZED)
        (map-set entity-compliance
            { entity: entity, rule-id: rule-id }
            {
                compliant: true,
                verified-at: stacks-block-height,
                expires-at: (+ stacks-block-height duration)
            }
        )
        (ok true)
    )
)

(define-public (revoke-compliance (entity principal) (rule-id (string-ascii 32)))
    (begin
        (asserts! (is-eq tx-sender (var-get compliance-admin)) ERR_UNAUTHORIZED)
        (map-delete entity-compliance { entity: entity, rule-id: rule-id })
        (ok true)
    )
)

(define-public (verify-compliance (entity principal) (rule-id (string-ascii 32)))
    (begin
        (asserts! (is-entity-compliant entity rule-id) ERR_NON_COMPLIANT)
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
