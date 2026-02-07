(define-map emissions
  { emission-id: uint }
  {
    facility-id: uint,
    emission-type: (string-ascii 50),
    quantity: uint,
    unit: (string-ascii 20),
    recorded-at: uint,
    operator: principal
  }
)

(define-data-var emission-nonce uint u0)

(define-public (record-emission (facility uint) (emission-type (string-ascii 50)) (quantity uint) (unit (string-ascii 20)))
  (let ((emission-id (+ (var-get emission-nonce) u1)))
    (map-set emissions
      { emission-id: emission-id }
      {
        facility-id: facility,
        emission-type: emission-type,
        quantity: quantity,
        unit: unit,
        recorded-at: stacks-block-height,
        operator: tx-sender
      }
    )
    (var-set emission-nonce emission-id)
    (ok emission-id)
  )
)

(define-read-only (get-emission (emission-id uint))
  (map-get? emissions { emission-id: emission-id })
)
