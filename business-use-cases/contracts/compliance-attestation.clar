(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))

(define-map compliance-attestations
  { project-id: uint, attestation-id: uint }
  {
    regulation: (string-ascii 100),
    compliant: bool,
    attested-at: uint
  }
)

(define-public (attest-compliance (project-id uint) (attestation-id uint) (regulation (string-ascii 100)) (compliant bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set compliance-attestations { project-id: project-id, attestation-id: attestation-id }
      { regulation: regulation, compliant: compliant, attested-at: stacks-block-height }
    )
    (ok true)
  )
)

(define-read-only (get-compliance-attestation (project-id uint) (attestation-id uint))
  (ok (map-get? compliance-attestations { project-id: project-id, attestation-id: attestation-id }))
)
