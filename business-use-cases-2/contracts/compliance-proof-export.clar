(define-map compliance-proofs (buff 32) {
  entity: principal,
  compliance-type: (string-ascii 50),
  proof-data-hash: (buff 32),
  issue-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-read-only (get-compliance-proof (proof-id (buff 32)))
  (map-get? compliance-proofs proof-id))

(define-public (generate-compliance-proof (proof-id (buff 32)) (compliance-type (string-ascii 50)) (proof-data-hash (buff 32)) (duration uint))
  (begin
    (asserts! (is-none (map-get? compliance-proofs proof-id)) (err u1))
    (ok (map-set compliance-proofs proof-id {
      entity: tx-sender,
      compliance-type: compliance-type,
      proof-data-hash: proof-data-hash,
      issue-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "valid"
    }))))

(define-public (export-proof (proof-id (buff 32)))
  (ok (map-get? compliance-proofs proof-id)))
