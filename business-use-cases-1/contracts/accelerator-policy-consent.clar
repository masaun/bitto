(define-map policy-consents
  { consent-id: uint }
  {
    startup-id: uint,
    policy-type: (string-ascii 100),
    policy-version: uint,
    consented-by: principal,
    consented-at: uint,
    consent-hash: (buff 32)
  }
)

(define-data-var consent-nonce uint u0)

(define-public (record-consent (startup uint) (policy-type (string-ascii 100)) (version uint) (hash (buff 32)))
  (let ((consent-id (+ (var-get consent-nonce) u1)))
    (map-set policy-consents
      { consent-id: consent-id }
      {
        startup-id: startup,
        policy-type: policy-type,
        policy-version: version,
        consented-by: tx-sender,
        consented-at: stacks-block-height,
        consent-hash: hash
      }
    )
    (var-set consent-nonce consent-id)
    (ok consent-id)
  )
)

(define-read-only (get-consent (consent-id uint))
  (map-get? policy-consents { consent-id: consent-id })
)
