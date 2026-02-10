(define-map escrow-disputes 
  uint 
  {
    escrow-id: uint,
    disputer: principal,
    reason: (string-ascii 256),
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var escrow-dispute-nonce uint u0)

(define-read-only (get-escrow-dispute (id uint))
  (map-get? escrow-disputes id)
)

(define-public (raise-escrow-dispute (escrow-id uint) (reason (string-ascii 256)))
  (let ((id (+ (var-get escrow-dispute-nonce) u1)))
    (map-set escrow-disputes id {
      escrow-id: escrow-id,
      disputer: tx-sender,
      reason: reason,
      status: "open",
      created-at: stacks-block-height
    })
    (var-set escrow-dispute-nonce id)
    (ok id)
  )
)
