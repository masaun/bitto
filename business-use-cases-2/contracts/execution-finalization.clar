(define-map finalizations 
  uint 
  {
    execution-id: uint,
    finalized-by: principal,
    finalized-at: uint,
    outcome: (string-ascii 128)
  }
)

(define-data-var final-nonce uint u0)

(define-read-only (get-finalization (id uint))
  (map-get? finalizations id)
)

(define-public (finalize (execution-id uint) (outcome (string-ascii 128)))
  (let ((id (+ (var-get final-nonce) u1)))
    (map-set finalizations id {
      execution-id: execution-id,
      finalized-by: tx-sender,
      finalized-at: stacks-block-height,
      outcome: outcome
    })
    (var-set final-nonce id)
    (ok id)
  )
)
