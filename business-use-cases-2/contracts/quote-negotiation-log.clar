(define-map negotiation-logs 
  uint 
  {
    quote-id: uint,
    actor: principal,
    action: (string-ascii 64),
    timestamp: uint
  }
)

(define-data-var log-nonce uint u0)

(define-read-only (get-log (id uint))
  (map-get? negotiation-logs id)
)

(define-public (log-action (quote-id uint) (action (string-ascii 64)))
  (let ((id (+ (var-get log-nonce) u1)))
    (map-set negotiation-logs id {
      quote-id: quote-id,
      actor: tx-sender,
      action: action,
      timestamp: stacks-block-height
    })
    (var-set log-nonce id)
    (ok id)
  )
)
