(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_REVOKED (err u102))

(define-data-var revocation-admin principal tx-sender)
(define-data-var next-revocation-id uint u1)

(define-map license-revocations
    uint
    {
        license-id: uint,
        revoked-by: principal,
        reason: (string-ascii 128),
        revoked-at: uint,
        status: (string-ascii 10)
    }
)

(define-map license-status
    uint
    bool
)

(define-read-only (get-revocation (revocation-id uint))
    (map-get? license-revocations revocation-id)
)

(define-read-only (is-license-revoked (license-id uint))
    (default-to false (map-get? license-status license-id))
)

(define-public (revoke-drone-license (license-id uint) (reason (string-ascii 128)))
    (let
        (
            (revocation-id (var-get next-revocation-id))
        )
        (asserts! (not (is-license-revoked license-id)) ERR_ALREADY_REVOKED)
        (map-set license-revocations revocation-id {
            license-id: license-id,
            revoked-by: tx-sender,
            reason: reason,
            revoked-at: stacks-block-height,
            status: "revoked"
        })
        (map-set license-status license-id true)
        (var-set next-revocation-id (+ revocation-id u1))
        (ok revocation-id)
    )
)

(define-public (reinstate-drone-license (license-id uint))
    (begin
        (asserts! (is-eq tx-sender (var-get revocation-admin)) ERR_UNAUTHORIZED)
        (map-delete license-status license-id)
        (ok true)
    )
)

(define-public (set-revocation-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get revocation-admin)) ERR_UNAUTHORIZED)
        (var-set revocation-admin new-admin)
        (ok true)
    )
)
