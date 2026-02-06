(define-map batches
  { batch-id: uint }
  {
    product-id: uint,
    facility-id: uint,
    quantity: uint,
    produced-at: uint,
    operator: principal,
    quality-status: (string-ascii 20)
  }
)

(define-data-var batch-nonce uint u0)

(define-public (record-batch (product uint) (facility uint) (quantity uint))
  (let ((batch-id (+ (var-get batch-nonce) u1)))
    (map-set batches
      { batch-id: batch-id }
      {
        product-id: product,
        facility-id: facility,
        quantity: quantity,
        produced-at: stacks-block-height,
        operator: tx-sender,
        quality-status: "pending"
      }
    )
    (var-set batch-nonce batch-id)
    (ok batch-id)
  )
)

(define-public (update-quality-status (batch-id uint) (status (string-ascii 20)))
  (match (map-get? batches { batch-id: batch-id })
    batch (ok (map-set batches { batch-id: batch-id } (merge batch { quality-status: status })))
    (err u404)
  )
)

(define-read-only (get-batch (batch-id uint))
  (map-get? batches { batch-id: batch-id })
)
