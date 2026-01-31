(define-map customer-contracts
  { contract-id: uint }
  {
    customer-id: uint,
    product-id: uint,
    quantity: uint,
    price-per-unit: uint,
    delivery-terms: (string-ascii 100),
    signed-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var contract-nonce uint u0)

(define-public (create-customer-contract (customer uint) (product uint) (quantity uint) (price uint) (terms (string-ascii 100)))
  (let ((contract-id (+ (var-get contract-nonce) u1)))
    (map-set customer-contracts
      { contract-id: contract-id }
      {
        customer-id: customer,
        product-id: product,
        quantity: quantity,
        price-per-unit: price,
        delivery-terms: terms,
        signed-at: stacks-block-height,
        status: "active"
      }
    )
    (var-set contract-nonce contract-id)
    (ok contract-id)
  )
)

(define-read-only (get-customer-contract (contract-id uint))
  (map-get? customer-contracts { contract-id: contract-id })
)
