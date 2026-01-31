(define-map kyc-aml
  { kyc-id: uint }
  {
    startup-id: uint,
    founder-id: uint,
    kyc-status: (string-ascii 20),
    aml-status: (string-ascii 20),
    verified-at: uint,
    verifier: principal,
    expiry: uint
  }
)

(define-data-var kyc-nonce uint u0)

(define-public (record-kyc-aml (startup uint) (founder uint) (kyc-status (string-ascii 20)) (aml-status (string-ascii 20)) (expiry uint))
  (let ((kyc-id (+ (var-get kyc-nonce) u1)))
    (map-set kyc-aml
      { kyc-id: kyc-id }
      {
        startup-id: startup,
        founder-id: founder,
        kyc-status: kyc-status,
        aml-status: aml-status,
        verified-at: stacks-block-height,
        verifier: tx-sender,
        expiry: expiry
      }
    )
    (var-set kyc-nonce kyc-id)
    (ok kyc-id)
  )
)

(define-read-only (get-kyc-aml (kyc-id uint))
  (map-get? kyc-aml { kyc-id: kyc-id })
)
