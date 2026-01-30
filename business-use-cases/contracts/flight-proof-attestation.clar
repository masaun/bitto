(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var attestation-admin principal tx-sender)
(define-data-var next-attestation-id uint u1)

(define-map flight-attestations
    uint
    {
        operator: principal,
        flight-hash: (buff 32),
        location-lat: int,
        location-lon: int,
        altitude: uint,
        timestamp: uint,
        verified: bool
    }
)

(define-read-only (get-flight-attestation (attestation-id uint))
    (map-get? flight-attestations attestation-id)
)

(define-public (attest-flight (flight-hash (buff 32)) (location-lat int) (location-lon int) (altitude uint) (timestamp uint))
    (let
        (
            (attestation-id (var-get next-attestation-id))
        )
        (map-set flight-attestations attestation-id {
            operator: tx-sender,
            flight-hash: flight-hash,
            location-lat: location-lat,
            location-lon: location-lon,
            altitude: altitude,
            timestamp: timestamp,
            verified: false
        })
        (var-set next-attestation-id (+ attestation-id u1))
        (ok attestation-id)
    )
)

(define-public (verify-flight (attestation-id uint))
    (let
        (
            (attestation (unwrap! (map-get? flight-attestations attestation-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (var-get attestation-admin)) ERR_UNAUTHORIZED)
        (map-set flight-attestations attestation-id (merge attestation { verified: true }))
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
