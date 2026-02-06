(define-map proofs (string-ascii 100) {
  batch-id: (string-ascii 100),
  auditor: principal,
  audit-date: uint,
  conflict-free: bool,
  evidence-hash: (buff 32),
  status: (string-ascii 20)
})

(define-data-var auditor-authority principal tx-sender)

(define-read-only (get-proof (proof-id (string-ascii 100)))
  (map-get? proofs proof-id))

(define-public (issue-proof (proof-id (string-ascii 100)) (batch-id (string-ascii 100)) (conflict-free bool) (evidence-hash (buff 32)))
  (begin
    (asserts! (is-eq tx-sender (var-get auditor-authority)) (err u1))
    (asserts! (is-none (map-get? proofs proof-id)) (err u2))
    (ok (map-set proofs proof-id {
      batch-id: batch-id,
      auditor: tx-sender,
      audit-date: stacks-block-height,
      conflict-free: conflict-free,
      evidence-hash: evidence-hash,
      status: "verified"
    }))))
