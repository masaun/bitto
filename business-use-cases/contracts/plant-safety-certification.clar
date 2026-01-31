(define-map certifications
  { certification-id: uint }
  {
    facility-id: uint,
    certification-type: (string-ascii 100),
    issued-by: (string-ascii 100),
    issued-at: uint,
    expiry: uint,
    status: (string-ascii 20)
  }
)

(define-data-var certification-nonce uint u0)

(define-public (issue-certification (facility uint) (cert-type (string-ascii 100)) (issuer (string-ascii 100)) (expiry uint))
  (let ((certification-id (+ (var-get certification-nonce) u1)))
    (map-set certifications
      { certification-id: certification-id }
      {
        facility-id: facility,
        certification-type: cert-type,
        issued-by: issuer,
        issued-at: stacks-block-height,
        expiry: expiry,
        status: "active"
      }
    )
    (var-set certification-nonce certification-id)
    (ok certification-id)
  )
)

(define-read-only (get-certification (certification-id uint))
  (map-get? certifications { certification-id: certification-id })
)
