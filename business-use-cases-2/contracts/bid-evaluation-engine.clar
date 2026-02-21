(define-map evaluations 
  uint 
  {
    bid-id: uint,
    evaluator: principal,
    score: uint,
    criteria: (string-ascii 256),
    evaluated-at: uint
  }
)

(define-data-var evaluation-nonce uint u0)

(define-read-only (get-evaluation (id uint))
  (map-get? evaluations id)
)

(define-public (evaluate-bid (bid-id uint) (score uint) (criteria (string-ascii 256)))
  (let ((id (+ (var-get evaluation-nonce) u1)))
    (map-set evaluations id {
      bid-id: bid-id,
      evaluator: tx-sender,
      score: score,
      criteria: criteria,
      evaluated-at: stacks-block-height
    })
    (var-set evaluation-nonce id)
    (ok id)
  )
)
