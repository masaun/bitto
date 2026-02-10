(define-map policy-audit-logs 
  uint 
  {
    policy-id: uint,
    action: (string-ascii 64),
    actor: principal,
    details: (string-ascii 256),
    timestamp: uint
  }
)

(define-data-var policy-audit-nonce uint u0)

(define-read-only (get-policy-audit (id uint))
  (map-get? policy-audit-logs id)
)

(define-public (log-policy-audit (policy-id uint) (action (string-ascii 64)) (details (string-ascii 256)))
  (let ((id (+ (var-get policy-audit-nonce) u1)))
    (map-set policy-audit-logs id {
      policy-id: policy-id,
      action: action,
      actor: tx-sender,
      details: details,
      timestamp: stacks-block-height
    })
    (var-set policy-audit-nonce id)
    (ok id)
  )
)
