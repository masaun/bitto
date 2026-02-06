(define-map orders
  { order-id: uint }
  {
    customer-id: uint,
    product-id: uint,
    quantity: uint,
    ordered-at: uint,
    status: (string-ascii 20),
    fulfilled-at: (optional uint)
  }
)

(define-data-var order-nonce uint u0)

(define-public (create-order (customer uint) (product uint) (quantity uint))
  (let ((order-id (+ (var-get order-nonce) u1)))
    (map-set orders
      { order-id: order-id }
      {
        customer-id: customer,
        product-id: product,
        quantity: quantity,
        ordered-at: stacks-block-height,
        status: "pending",
        fulfilled-at: none
      }
    )
    (var-set order-nonce order-id)
    (ok order-id)
  )
)

(define-public (fulfill-order (order-id uint))
  (match (map-get? orders { order-id: order-id })
    order (ok (map-set orders { order-id: order-id } (merge order { status: "fulfilled", fulfilled-at: (some stacks-block-height) })))
    (err u404)
  )
)

(define-read-only (get-order (order-id uint))
  (map-get? orders { order-id: order-id })
)
