(define-map resources
  { resource-id: uint }
  {
    resource-type: (string-ascii 50),
    startup-id: uint,
    quantity: uint,
    allocated-at: uint,
    expiry: uint,
    status: (string-ascii 20)
  }
)

(define-data-var resource-nonce uint u0)

(define-public (allocate-resource (resource-type (string-ascii 50)) (startup uint) (quantity uint) (expiry uint))
  (let ((resource-id (+ (var-get resource-nonce) u1)))
    (map-set resources
      { resource-id: resource-id }
      {
        resource-type: resource-type,
        startup-id: startup,
        quantity: quantity,
        allocated-at: stacks-block-height,
        expiry: expiry,
        status: "active"
      }
    )
    (var-set resource-nonce resource-id)
    (ok resource-id)
  )
)

(define-read-only (get-resource (resource-id uint))
  (map-get? resources { resource-id: resource-id })
)
