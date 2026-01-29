(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_REVOKED (err u102))

(define-data-var revocation-admin principal tx-sender)

(define-map revocations
    uint
    {
        license-id: uint,
        revoked-by: principal,
        reason: (string-ascii 128),
        revoked-at: uint,
        status: (string-ascii 10)
    }
)

(define-map license-revocation-status
    uint
    bool
)

(define-read-only (get-revocation (revocation-id uint))
    (map-get? revocations revocation-id)
)

(define-read-only (is-license-revoked (license-id uint))
    (default-to false (map-get? license-revocation-status license-id))
)

(define-data-var next-revocation-id uint u1)

(define-public (revoke-license (license-id uint) (reason (string-ascii 128)))
    (let
        (
            (revocation-id (var-get next-revocation-id))
        )
        (asserts! (not (is-license-revoked license-id)) ERR_ALREADY_REVOKED)
        (map-set revocations revocation-id {
            license-id: license-id,
            revoked-by: tx-sender,
            reason: reason,
            revoked-at: stacks-block-height,
            status: "revoked"
        })
        (map-set license-revocation-status license-id true)
        (var-set next-revocation-id (+ revocation-id u1))
        (ok revocation-id)
    )
)

(define-public (suspend-license (license-id uint) (reason (string-ascii 128)))
    (let
        (
            (revocation-id (var-get next-revocation-id))
        )
        (map-set revocations revocation-id {
            license-id: license-id,
            revoked-by: tx-sender,
            reason: reason,
            revoked-at: stacks-block-height,
            status: "suspended"
        })
        (map-set license-revocation-status license-id true)
        (var-set next-revocation-id (+ revocation-id u1))
        (ok revocation-id)
    )
)

(define-public (reinstate-license (license-id uint))
    (begin
        (asserts! (is-eq tx-sender (var-get revocation-admin)) ERR_UNAUTHORIZED)
        (map-delete license-revocation-status license-id)
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
