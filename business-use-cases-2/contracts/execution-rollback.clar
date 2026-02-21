(define-map rollbacks 
  uint 
  {
    execution-id: uint,
    rolled-back-by: principal,
    reason: (string-ascii 256),
    rolled-back-at: uint
  }
)

(define-data-var rollback-nonce uint u0)

(define-read-only (get-rollback (id uint))
  (map-get? rollbacks id)
)

(define-public (rollback-execution (execution-id uint) (reason (string-ascii 256)))
  (let ((id (+ (var-get rollback-nonce) u1)))
    (map-set rollbacks id {
      execution-id: execution-id,
      rolled-back-by: tx-sender,
      reason: reason,
      rolled-back-at: stacks-block-height
    })
    (var-set rollback-nonce id)
    (ok id)
  )
)
