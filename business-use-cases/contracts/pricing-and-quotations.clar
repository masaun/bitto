(define-map quotations
  { quotation-id: uint }
  {
    customer-id: uint,
    product-id: uint,
    quantity: uint,
    price-per-unit: uint,
    valid-until: uint,
    issued-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var quotation-nonce uint u0)

(define-public (create-quotation (customer uint) (product uint) (quantity uint) (price uint) (valid-until uint))
  (let ((quotation-id (+ (var-get quotation-nonce) u1)))
    (map-set quotations
      { quotation-id: quotation-id }
      {
        customer-id: customer,
        product-id: product,
        quantity: quantity,
        price-per-unit: price,
        valid-until: valid-until,
        issued-at: stacks-block-height,
        status: "pending"
      }
    )
    (var-set quotation-nonce quotation-id)
    (ok quotation-id)
  )
)

(define-public (accept-quotation (quotation-id uint))
  (match (map-get? quotations { quotation-id: quotation-id })
    quotation (ok (map-set quotations { quotation-id: quotation-id } (merge quotation { status: "accepted" })))
    (err u404)
  )
)

(define-read-only (get-quotation (quotation-id uint))
  (map-get? quotations { quotation-id: quotation-id })
)
