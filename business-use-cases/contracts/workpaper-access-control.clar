(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_ACCESS_DENIED (err u101))

(define-data-var access-admin principal tx-sender)

(define-map workpaper-access
    { engagement-id: uint, user: principal }
    {
        access-level: (string-ascii 20),
        granted-at: uint,
        expires-at: uint
    }
)

(define-read-only (get-access (engagement-id uint) (user principal))
    (map-get? workpaper-access { engagement-id: engagement-id, user: user })
)

(define-read-only (has-access (engagement-id uint) (user principal))
    (match (map-get? workpaper-access { engagement-id: engagement-id, user: user })
        access (>= (get expires-at access) stacks-block-height)
        false
    )
)

(define-public (grant-access (engagement-id uint) (user principal) (access-level (string-ascii 20)) (duration uint))
    (begin
        (asserts! (is-eq tx-sender (var-get access-admin)) ERR_UNAUTHORIZED)
        (map-set workpaper-access
            { engagement-id: engagement-id, user: user }
            {
                access-level: access-level,
                granted-at: stacks-block-height,
                expires-at: (+ stacks-block-height duration)
            }
        )
        (ok true)
    )
)

(define-public (revoke-access (engagement-id uint) (user principal))
    (begin
        (asserts! (is-eq tx-sender (var-get access-admin)) ERR_UNAUTHORIZED)
        (map-delete workpaper-access { engagement-id: engagement-id, user: user })
        (ok true)
    )
)

(define-public (verify-access (engagement-id uint))
    (begin
        (asserts! (has-access engagement-id tx-sender) ERR_ACCESS_DENIED)
        (ok true)
    )
)

(define-public (set-access-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get access-admin)) ERR_UNAUTHORIZED)
        (var-set access-admin new-admin)
        (ok true)
    )
)
