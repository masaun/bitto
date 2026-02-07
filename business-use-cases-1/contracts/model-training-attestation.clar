(define-constant ERR_UNAUTHORIZED (err u100))

(define-data-var attestation-admin principal tx-sender)
(define-data-var next-attestation-id uint u1)

(define-map training-attestations
    uint
    {
        model-id: uint,
        dataset-id: uint,
        training-hash: (buff 32),
        attested-by: principal,
        attested-at: uint,
        compliant: bool
    }
)

(define-read-only (get-training-attestation (attestation-id uint))
    (map-get? training-attestations attestation-id)
)

(define-public (attest-training (model-id uint) (dataset-id uint) (training-hash (buff 32)) (compliant bool))
    (let
        (
            (attestation-id (var-get next-attestation-id))
        )
        (map-set training-attestations attestation-id {
            model-id: model-id,
            dataset-id: dataset-id,
            training-hash: training-hash,
            attested-by: tx-sender,
            attested-at: stacks-block-height,
            compliant: compliant
        })
        (var-set next-attestation-id (+ attestation-id u1))
        (ok attestation-id)
    )
)

(define-public (set-attestation-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get attestation-admin)) ERR_UNAUTHORIZED)
        (var-set attestation-admin new-admin)
        (ok true)
    )
)
