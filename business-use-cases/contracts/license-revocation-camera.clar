(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_ALREADY_REVOKED (err u102))

(define-data-var revocation-admin principal tx-sender)
(define-data-var next-revocation-id uint u1)

(define-map camera-license-revocations
    uint
    {
        license-id: uint,
        revoked-by: principal,
        reason: (string-ascii 128),
        revoked-at: uint
    }
)

(define-map camera-license-status
    uint
    bool
)

(define-read-only (get-camera-license-revocation (revocation-id uint))
    (map-get? camera-license-revocations revocation-id)
)

(define-read-only (is-camera-license-revoked (license-id uint))
    (default-to false (map-get? camera-license-status license-id))
)

(define-public (revoke-camera-license (license-id uint) (reason (string-ascii 128)))
    (let
        (
            (revocation-id (var-get next-revocation-id))
        )
        (asserts! (not (is-camera-license-revoked license-id)) ERR_ALREADY_REVOKED)
        (map-set camera-license-revocations revocation-id {
            license-id: license-id,
            revoked-by: tx-sender,
            reason: reason,
            revoked-at: stacks-block-height
        })
        (map-set camera-license-status license-id true)
        (var-set next-revocation-id (+ revocation-id u1))
        (ok revocation-id)
    )
)

(define-public (reinstate-camera-license (license-id uint))
    (begin
        (asserts! (is-eq tx-sender (var-get revocation-admin)) ERR_UNAUTHORIZED)
        (map-delete camera-license-status license-id)
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
