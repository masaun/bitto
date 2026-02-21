(define-map rejections 
  uint 
  {
    quote-id: uint,
    rejector: principal,
    reason: (string-ascii 256),
    rejected-at: uint
  }
)

(define-data-var rejection-nonce uint u0)

(define-read-only (get-rejection (id uint))
  (map-get? rejections id)
)

(define-public (reject-quote (quote-id uint) (reason (string-ascii 256)))
  (let ((id (+ (var-get rejection-nonce) u1)))
    (map-set rejections id {
      quote-id: quote-id,
      rejector: tx-sender,
      reason: reason,
      rejected-at: stacks-block-height
    })
    (var-set rejection-nonce id)
    (ok id)
  )
)
