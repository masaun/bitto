(define-map confidential-sharing
  { sharing-id: uint }
  {
    startup-id: uint,
    document-hash: (buff 32),
    shared-with: principal,
    shared-at: uint,
    expiry: uint,
    nda-required: bool
  }
)

(define-data-var sharing-nonce uint u0)

(define-public (share-confidential-material (startup uint) (doc-hash (buff 32)) (recipient principal) (expiry uint) (nda bool))
  (let ((sharing-id (+ (var-get sharing-nonce) u1)))
    (map-set confidential-sharing
      { sharing-id: sharing-id }
      {
        startup-id: startup,
        document-hash: doc-hash,
        shared-with: recipient,
        shared-at: stacks-block-height,
        expiry: expiry,
        nda-required: nda
      }
    )
    (var-set sharing-nonce sharing-id)
    (ok sharing-id)
  )
)

(define-read-only (get-confidential-sharing (sharing-id uint))
  (map-get? confidential-sharing { sharing-id: sharing-id })
)
