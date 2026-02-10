(define-map conditions 
  uint 
  {
    payment-id: uint,
    condition-type: (string-ascii 32),
    threshold: uint,
    met: bool
  }
)

(define-data-var condition-nonce uint u0)

(define-read-only (get-condition (id uint))
  (map-get? conditions id)
)

(define-public (add-condition (payment-id uint) (condition-type (string-ascii 32)) (threshold uint))
  (let ((id (+ (var-get condition-nonce) u1)))
    (map-set conditions id {
      payment-id: payment-id,
      condition-type: condition-type,
      threshold: threshold,
      met: false
    })
    (var-set condition-nonce id)
    (ok id)
  )
)

(define-public (mark-condition-met (id uint))
  (let ((condition (unwrap! (map-get? conditions id) (err u1))))
    (map-set conditions id (merge condition {met: true}))
    (ok true)
  )
)

(define-read-only (check-conditions (payment-id uint))
  (ok true)
)
