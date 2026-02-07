(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map mission-attestations
  { mission-id: uint }
  {
    proof-hash: (buff 32),
    verified: bool,
    attested-at: uint
  }
)

(define-public (attest-mission (mission-id uint) (proof-hash (buff 32)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set mission-attestations { mission-id: mission-id }
      {
        proof-hash: proof-hash,
        verified: true,
        attested-at: stacks-block-height
      }
    )
    (ok true)
  )
)

(define-read-only (get-attestation (mission-id uint))
  (ok (map-get? mission-attestations { mission-id: mission-id }))
)
