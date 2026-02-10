(define-map cancellations 
  uint 
  {
    execution-id: uint,
    cancelled-by: principal,
    reason: (string-ascii 256),
    cancelled-at: uint
  }
)

(define-data-var cancel-nonce uint u0)

(define-read-only (get-cancellation (id uint))
  (map-get? cancellations id)
)

(define-public (cancel-execution (execution-id uint) (reason (string-ascii 256)))
  (let ((id (+ (var-get cancel-nonce) u1)))
    (map-set cancellations id {
      execution-id: execution-id,
      cancelled-by: tx-sender,
      reason: reason,
      cancelled-at: stacks-block-height
    })
    (var-set cancel-nonce id)
    (ok id)
  )
)
