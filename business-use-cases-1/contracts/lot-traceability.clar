(define-map traceability
  { lot-id: uint }
  {
    product-id: uint,
    batch-id: uint,
    produced-at: uint,
    origin-facility: uint,
    current-location: (string-ascii 100),
    status: (string-ascii 20)
  }
)

(define-data-var lot-nonce uint u0)

(define-public (record-lot (product uint) (batch uint) (facility uint))
  (let ((lot-id (+ (var-get lot-nonce) u1)))
    (map-set traceability
      { lot-id: lot-id }
      {
        product-id: product,
        batch-id: batch,
        produced-at: stacks-block-height,
        origin-facility: facility,
        current-location: "warehouse",
        status: "active"
      }
    )
    (var-set lot-nonce lot-id)
    (ok lot-id)
  )
)

(define-public (update-location (lot-id uint) (location (string-ascii 100)))
  (match (map-get? traceability { lot-id: lot-id })
    lot (ok (map-set traceability { lot-id: lot-id } (merge lot { current-location: location })))
    (err u404)
  )
)

(define-read-only (get-lot (lot-id uint))
  (map-get? traceability { lot-id: lot-id })
)
