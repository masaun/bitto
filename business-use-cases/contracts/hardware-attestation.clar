(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var attestation-admin principal tx-sender)
(define-data-var next-attestation-id uint u1)

(define-map hardware-attestations
    uint
    {
        device-id: (string-ascii 64),
        hardware-hash: (buff 32),
        verified: bool,
        attested-at: uint
    }
)

(define-read-only (get-hardware-attestation (attestation-id uint))
    (map-get? hardware-attestations attestation-id)
)

(define-public (attest-hardware (device-id (string-ascii 64)) (hardware-hash (buff 32)))
    (let
        (
            (attestation-id (var-get next-attestation-id))
        )
        (map-set hardware-attestations attestation-id {
            device-id: device-id,
            hardware-hash: hardware-hash,
            verified: false,
            attested-at: stacks-block-height
        })
        (var-set next-attestation-id (+ attestation-id u1))
        (ok attestation-id)
    )
)

(define-public (verify-hardware (attestation-id uint))
    (let
        (
            (attestation (unwrap! (map-get? hardware-attestations attestation-id) (err u101)))
        )
        (asserts! (is-eq tx-sender (var-get attestation-admin)) ERR_UNAUTHORIZED)
        (map-set hardware-attestations attestation-id (merge attestation { verified: true }))
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
