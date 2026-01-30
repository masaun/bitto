(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var consent-admin principal tx-sender)
(define-data-var next-consent-id uint u1)

(define-map consents
    uint
    {
        subject: principal,
        data-controller: principal,
        purpose: (string-ascii 64),
        scope: (string-ascii 128),
        granted-at: uint,
        expires-at: uint,
        status: (string-ascii 10)
    }
)

(define-map subject-consents
    { subject: principal, data-controller: principal }
    (list 100 uint)
)

(define-read-only (get-consent (consent-id uint))
    (map-get? consents consent-id)
)

(define-read-only (is-consent-valid (consent-id uint))
    (match (map-get? consents consent-id)
        consent (and
            (is-eq (get status consent) "active")
            (>= (get expires-at consent) stacks-block-height)
        )
        false
    )
)

(define-read-only (get-subject-consents (subject principal) (data-controller principal))
    (default-to (list) (map-get? subject-consents { subject: subject, data-controller: data-controller }))
)

(define-public (grant-consent (data-controller principal) (purpose (string-ascii 64)) (scope (string-ascii 128)) (duration uint))
    (let
        (
            (consent-id (var-get next-consent-id))
            (expires-at (+ stacks-block-height duration))
            (existing-consents (default-to (list) (map-get? subject-consents { subject: tx-sender, data-controller: data-controller })))
        )
        (map-set consents consent-id {
            subject: tx-sender,
            data-controller: data-controller,
            purpose: purpose,
            scope: scope,
            granted-at: stacks-block-height,
            expires-at: expires-at,
            status: "active"
        })
        (map-set subject-consents
            { subject: tx-sender, data-controller: data-controller }
            (unwrap-panic (as-max-len? (append existing-consents consent-id) u100))
        )
        (var-set next-consent-id (+ consent-id u1))
        (ok consent-id)
    )
)

(define-public (revoke-consent (consent-id uint))
    (let
        (
            (consent (unwrap! (map-get? consents consent-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get subject consent) tx-sender) ERR_UNAUTHORIZED)
        (map-set consents consent-id (merge consent { status: "revoked" }))
        (ok true)
    )
)

(define-public (verify-consent (consent-id uint) (data-controller principal))
    (let
        (
            (consent (unwrap! (map-get? consents consent-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get data-controller consent) data-controller) ERR_UNAUTHORIZED)
        (ok (is-consent-valid consent-id))
    )
)

(define-public (set-consent-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get consent-admin)) ERR_UNAUTHORIZED)
        (var-set consent-admin new-admin)
        (ok true)
    )
)
