(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var attestation-admin principal tx-sender)
(define-data-var next-attestation-id uint u1)

(define-map audit-attestations
    uint
    {
        engagement-id: uint,
        attestation-hash: (buff 32),
        auditor: principal,
        attested-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-attestation (attestation-id uint))
    (map-get? audit-attestations attestation-id)
)

(define-public (submit-attestation (engagement-id uint) (attestation-hash (buff 32)))
    (let
        (
            (attestation-id (var-get next-attestation-id))
        )
        (map-set audit-attestations attestation-id {
            engagement-id: engagement-id,
            attestation-hash: attestation-hash,
            auditor: tx-sender,
            attested-at: stacks-block-height,
            status: "pending"
        })
        (var-set next-attestation-id (+ attestation-id u1))
        (ok attestation-id)
    )
)

(define-public (verify-attestation (attestation-id uint))
    (let
        (
            (attestation (unwrap! (map-get? audit-attestations attestation-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get attestation-admin)) ERR_UNAUTHORIZED)
        (map-set audit-attestations attestation-id (merge attestation { status: "verified" }))
        (ok true)
    )
)

(define-public (set-attestation-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get attestation-admin)) ERR_UNAUTHORIZED)
        (var-set attestation-admin new-admin)
        (ok true)
    )
)
