(define-map kyc-records 
  principal 
  {
    verified: bool,
    verification-level: uint,
    verified-by: principal,
    verified-at: uint
  }
)

(define-read-only (get-kyc (supplier principal))
  (map-get? kyc-records supplier)
)

(define-public (verify-kyc (supplier principal) (level uint))
  (begin
    (map-set kyc-records supplier {
      verified: true,
      verification-level: level,
      verified-by: tx-sender,
      verified-at: stacks-block-height
    })
    (ok true)
  )
)

(define-read-only (is-kyc-verified (supplier principal))
  (match (map-get? kyc-records supplier)
    record (ok (get verified record))
    (ok false)
  )
)
