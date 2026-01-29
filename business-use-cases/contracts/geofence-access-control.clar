(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_ACCESS_DENIED (err u101))

(define-data-var access-admin principal tx-sender)

(define-map geofence-rules
    { region: (string-ascii 64), user: principal }
    {
        allowed: bool,
        expires-at: uint
    }
)

(define-read-only (get-geofence-rule (region (string-ascii 64)) (user principal))
    (map-get? geofence-rules { region: region, user: user })
)

(define-read-only (has-geofence-access (region (string-ascii 64)) (user principal))
    (match (map-get? geofence-rules { region: region, user: user })
        rule (and
            (get allowed rule)
            (>= (get expires-at rule) stacks-block-height)
        )
        false
    )
)

(define-public (grant-geofence-access (region (string-ascii 64)) (user principal) (duration uint))
    (begin
        (asserts! (is-eq tx-sender (var-get access-admin)) ERR_UNAUTHORIZED)
        (map-set geofence-rules
            { region: region, user: user }
            {
                allowed: true,
                expires-at: (+ stacks-block-height duration)
            }
        )
        (ok true)
    )
)

(define-public (revoke-geofence-access (region (string-ascii 64)) (user principal))
    (begin
        (asserts! (is-eq tx-sender (var-get access-admin)) ERR_UNAUTHORIZED)
        (map-delete geofence-rules { region: region, user: user })
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
