(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var proof-admin principal tx-sender)
(define-data-var next-proof-id uint u1)

(define-map capture-proofs
    uint
    {
        capture-id: uint,
        proof-hash: (buff 32),
        timestamp: uint,
        location-verified: bool,
        device-verified: bool,
        verified-at: uint
    }
)

(define-read-only (get-capture-proof (proof-id uint))
    (map-get? capture-proofs proof-id)
)

(define-public (submit-capture-proof (capture-id uint) (proof-hash (buff 32)) (timestamp uint))
    (let
        (
            (proof-id (var-get next-proof-id))
        )
        (map-set capture-proofs proof-id {
            capture-id: capture-id,
            proof-hash: proof-hash,
            timestamp: timestamp,
            location-verified: false,
            device-verified: false,
            verified-at: stacks-block-height
        })
        (var-set next-proof-id (+ proof-id u1))
        (ok proof-id)
    )
)

(define-public (verify-capture-proof (proof-id uint) (location-verified bool) (device-verified bool))
    (let
        (
            (proof (unwrap! (map-get? capture-proofs proof-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get proof-admin)) ERR_UNAUTHORIZED)
        (map-set capture-proofs proof-id (merge proof {
            location-verified: location-verified,
            device-verified: device-verified
        }))
        (ok true)
    )
)

(define-public (set-proof-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get proof-admin)) ERR_UNAUTHORIZED)
        (var-set proof-admin new-admin)
        (ok true)
    )
)
