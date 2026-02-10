(define-map evaluations-proc 
  uint 
  {
    procurement-id: uint,
    evaluator: principal,
    technical-score: uint,
    financial-score: uint,
    overall-score: uint,
    evaluated-at: uint
  }
)

(define-data-var eval-nonce uint u0)

(define-read-only (get-procurement-evaluation (id uint))
  (map-get? evaluations-proc id)
)

(define-public (evaluate-procurement (procurement-id uint) (tech-score uint) (fin-score uint))
  (let 
    (
      (id (+ (var-get eval-nonce) u1))
      (overall (/ (+ tech-score fin-score) u2))
    )
    (map-set evaluations-proc id {
      procurement-id: procurement-id,
      evaluator: tx-sender,
      technical-score: tech-score,
      financial-score: fin-score,
      overall-score: overall,
      evaluated-at: stacks-block-height
    })
    (var-set eval-nonce id)
    (ok id)
  )
)
