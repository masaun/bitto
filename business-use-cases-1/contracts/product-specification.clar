(define-map specifications
  { spec-id: uint }
  {
    product-id: uint,
    version: uint,
    specification-hash: (buff 32),
    issued-at: uint,
    issued-by: principal
  }
)

(define-data-var spec-nonce uint u0)

(define-public (create-specification (product uint) (version uint) (spec-hash (buff 32)))
  (let ((spec-id (+ (var-get spec-nonce) u1)))
    (map-set specifications
      { spec-id: spec-id }
      {
        product-id: product,
        version: version,
        specification-hash: spec-hash,
        issued-at: stacks-block-height,
        issued-by: tx-sender
      }
    )
    (var-set spec-nonce spec-id)
    (ok spec-id)
  )
)

(define-read-only (get-specification (spec-id uint))
  (map-get? specifications { spec-id: spec-id })
)
