(define-map escrow-audit-logs 
  uint 
  {
    escrow-id: uint,
    event: (string-ascii 128),
    actor: principal,
    timestamp: uint
  }
)

(define-data-var escrow-audit-nonce uint u0)

(define-read-only (get-escrow-audit (id uint))
  (map-get? escrow-audit-logs id)
)

(define-public (log-escrow-audit (escrow-id uint) (event (string-ascii 128)))
  (let ((id (+ (var-get escrow-audit-nonce) u1)))
    (map-set escrow-audit-logs id {
      escrow-id: escrow-id,
      event: event,
      actor: tx-sender,
      timestamp: stacks-block-height
    })
    (var-set escrow-audit-nonce id)
    (ok id)
  )
)
