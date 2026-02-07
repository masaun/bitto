(define-map shipments
  { shipment-id: uint }
  {
    product-id: uint,
    origin: (string-ascii 100),
    destination: (string-ascii 100),
    quantity: uint,
    shipped-at: uint,
    expected-delivery: uint,
    status: (string-ascii 20)
  }
)

(define-data-var shipment-nonce uint u0)

(define-public (create-shipment (product uint) (origin (string-ascii 100)) (destination (string-ascii 100)) (quantity uint) (expected uint))
  (let ((shipment-id (+ (var-get shipment-nonce) u1)))
    (map-set shipments
      { shipment-id: shipment-id }
      {
        product-id: product,
        origin: origin,
        destination: destination,
        quantity: quantity,
        shipped-at: stacks-block-height,
        expected-delivery: expected,
        status: "in-transit"
      }
    )
    (var-set shipment-nonce shipment-id)
    (ok shipment-id)
  )
)

(define-public (update-shipment-status (shipment-id uint) (status (string-ascii 20)))
  (match (map-get? shipments { shipment-id: shipment-id })
    shipment (ok (map-set shipments { shipment-id: shipment-id } (merge shipment { status: status })))
    (err u404)
  )
)

(define-read-only (get-shipment (shipment-id uint))
  (map-get? shipments { shipment-id: shipment-id })
)
