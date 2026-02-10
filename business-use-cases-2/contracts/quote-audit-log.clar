(define-map audit-entries 
  uint 
  {
    quote-id: uint,
    event-type: (string-ascii 32),
    actor: principal,
    timestamp: uint,
    data: (string-ascii 256)
  }
)

(define-data-var audit-nonce uint u0)

(define-read-only (get-audit-entry (id uint))
  (map-get? audit-entries id)
)

(define-public (log-audit (quote-id uint) (event-type (string-ascii 32)) (data (string-ascii 256)))
  (let ((id (+ (var-get audit-nonce) u1)))
    (map-set audit-entries id {
      quote-id: quote-id,
      event-type: event-type,
      actor: tx-sender,
      timestamp: stacks-block-height,
      data: data
    })
    (var-set audit-nonce id)
    (ok id)
  )
)
