(define-map attestations uint {
  operator: principal,
  attestation-type: (string-ascii 50),
  attestation-date: uint,
  valid-until: uint,
  status: (string-ascii 20)
})

(define-data-var attestation-counter uint u0)

(define-read-only (get-attestation (attestation-id uint))
  (map-get? attestations attestation-id))

(define-public (submit-attestation (attestation-type (string-ascii 50)) (duration uint))
  (let ((new-id (+ (var-get attestation-counter) u1)))
    (map-set attestations new-id {
      operator: tx-sender,
      attestation-type: attestation-type,
      attestation-date: stacks-block-height,
      valid-until: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set attestation-counter new-id)
    (ok new-id)))
