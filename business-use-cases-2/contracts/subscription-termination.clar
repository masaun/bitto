(define-map terminations 
  uint 
  {
    subscription-id: uint,
    reason: (string-ascii 256),
    terminated-by: principal,
    terminated-at: uint
  }
)

(define-data-var termination-nonce uint u0)

(define-read-only (get-termination (id uint))
  (map-get? terminations id)
)

(define-public (terminate-subscription (subscription-id uint) (reason (string-ascii 256)))
  (let ((id (+ (var-get termination-nonce) u1)))
    (map-set terminations id {
      subscription-id: subscription-id,
      reason: reason,
      terminated-by: tx-sender,
      terminated-at: stacks-block-height
    })
    (var-set termination-nonce id)
    (ok id)
  )
)
