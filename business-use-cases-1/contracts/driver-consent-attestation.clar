(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var consent-admin principal tx-sender)
(define-data-var next-consent-id uint u1)

(define-map driver-consents
    uint
    {
        driver: principal,
        vehicle-id: uint,
        consent-type: (string-ascii 64),
        granted-at: uint,
        expires-at: uint,
        status: (string-ascii 10)
    }
)

(define-read-only (get-driver-consent (consent-id uint))
    (map-get? driver-consents consent-id)
)

(define-read-only (is-consent-active (consent-id uint))
    (match (map-get? driver-consents consent-id)
        consent (and
            (is-eq (get status consent) "active")
            (>= (get expires-at consent) stacks-block-height)
        )
        false
    )
)

(define-public (grant-driver-consent (vehicle-id uint) (consent-type (string-ascii 64)) (duration uint))
    (let
        (
            (consent-id (var-get next-consent-id))
        )
        (map-set driver-consents consent-id {
            driver: tx-sender,
            vehicle-id: vehicle-id,
            consent-type: consent-type,
            granted-at: stacks-block-height,
            expires-at: (+ stacks-block-height duration),
            status: "active"
        })
        (var-set next-consent-id (+ consent-id u1))
        (ok consent-id)
    )
)

(define-public (revoke-driver-consent (consent-id uint))
    (let
        (
            (consent (unwrap! (map-get? driver-consents consent-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq (get driver consent) tx-sender) ERR_UNAUTHORIZED)
        (map-set driver-consents consent-id (merge consent { status: "revoked" }))
        (ok true)
    )
)

(define-public (set-consent-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get consent-admin)) ERR_UNAUTHORIZED)
        (var-set consent-admin new-admin)
        (ok true)
    )
)
