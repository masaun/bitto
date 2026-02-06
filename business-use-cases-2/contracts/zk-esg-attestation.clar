(define-map attestations (buff 32) {
  entity: principal,
  esg-category: (string-ascii 50),
  attestation-date: uint,
  proof-hash: (buff 32),
  verifier: principal,
  status: (string-ascii 20)
})

(define-read-only (get-attestation (attestation-id (buff 32)))
  (map-get? attestations attestation-id))

(define-public (create-attestation (attestation-id (buff 32)) (esg-category (string-ascii 50)) (proof-hash (buff 32)))
  (begin
    (asserts! (is-none (map-get? attestations attestation-id)) (err u1))
    (ok (map-set attestations attestation-id {
      entity: tx-sender,
      esg-category: esg-category,
      attestation-date: stacks-block-height,
      proof-hash: proof-hash,
      verifier: tx-sender,
      status: "pending"
    }))))

(define-public (verify-attestation (attestation-id (buff 32)))
  (begin
    (asserts! (is-some (map-get? attestations attestation-id)) (err u2))
    (ok (map-set attestations attestation-id (merge (unwrap-panic (map-get? attestations attestation-id)) { 
      verifier: tx-sender,
      status: "verified"
    })))))
