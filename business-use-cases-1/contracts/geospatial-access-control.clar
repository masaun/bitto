(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_ACCESS_DENIED (err u101))
(define-constant ERR_RESTRICTED_ZONE (err u102))

(define-data-var access-admin principal tx-sender)

(define-map access-rules
    { region: (string-ascii 64), user: principal }
    {
        allowed: bool,
        min-altitude: uint,
        max-altitude: uint,
        expires-at: uint
    }
)

(define-map restricted-zones
    (string-ascii 64)
    bool
)

(define-read-only (get-access-rule (region (string-ascii 64)) (user principal))
    (map-get? access-rules { region: region, user: user })
)

(define-read-only (is-zone-restricted (region (string-ascii 64)))
    (default-to false (map-get? restricted-zones region))
)

(define-read-only (has-access (region (string-ascii 64)) (user principal) (altitude uint))
    (match (map-get? access-rules { region: region, user: user })
        rule (and
            (get allowed rule)
            (>= (get expires-at rule) stacks-block-height)
            (>= altitude (get min-altitude rule))
            (<= altitude (get max-altitude rule))
            (not (is-zone-restricted region))
        )
        false
    )
)

(define-public (grant-access (region (string-ascii 64)) (user principal) (min-altitude uint) (max-altitude uint) (duration uint))
    (begin
        (asserts! (is-eq tx-sender (var-get access-admin)) ERR_UNAUTHORIZED)
        (asserts! (not (is-zone-restricted region)) ERR_RESTRICTED_ZONE)
        (map-set access-rules
            { region: region, user: user }
            {
                allowed: true,
                min-altitude: min-altitude,
                max-altitude: max-altitude,
                expires-at: (+ stacks-block-height duration)
            }
        )
        (ok true)
    )
)

(define-public (revoke-access (region (string-ascii 64)) (user principal))
    (begin
        (asserts! (is-eq tx-sender (var-get access-admin)) ERR_UNAUTHORIZED)
        (map-delete access-rules { region: region, user: user })
        (ok true)
    )
)

(define-public (add-restricted-zone (region (string-ascii 64)))
    (begin
        (asserts! (is-eq tx-sender (var-get access-admin)) ERR_UNAUTHORIZED)
        (map-set restricted-zones region true)
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
