(define-map waste-records
  { waste-id: uint }
  {
    facility-id: uint,
    waste-type: (string-ascii 100),
    quantity: uint,
    disposal-method: (string-ascii 100),
    disposed-at: uint,
    operator: principal
  }
)

(define-data-var waste-nonce uint u0)

(define-public (record-waste (facility uint) (waste-type (string-ascii 100)) (quantity uint) (method (string-ascii 100)))
  (let ((waste-id (+ (var-get waste-nonce) u1)))
    (map-set waste-records
      { waste-id: waste-id }
      {
        facility-id: facility,
        waste-type: waste-type,
        quantity: quantity,
        disposal-method: method,
        disposed-at: stacks-block-height,
        operator: tx-sender
      }
    )
    (var-set waste-nonce waste-id)
    (ok waste-id)
  )
)

(define-read-only (get-waste-record (waste-id uint))
  (map-get? waste-records { waste-id: waste-id })
)
