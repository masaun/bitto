(define-map scores
  { score-id: uint }
  {
    application-id: uint,
    criteria-id: uint,
    score: uint,
    scorer: principal,
    scored-at: uint,
    notes: (string-ascii 200)
  }
)

(define-data-var score-nonce uint u0)

(define-public (submit-score (application uint) (criteria uint) (score uint) (notes (string-ascii 200)))
  (let ((score-id (+ (var-get score-nonce) u1)))
    (map-set scores
      { score-id: score-id }
      {
        application-id: application,
        criteria-id: criteria,
        score: score,
        scorer: tx-sender,
        scored-at: stacks-block-height,
        notes: notes
      }
    )
    (var-set score-nonce score-id)
    (ok score-id)
  )
)

(define-read-only (get-score (score-id uint))
  (map-get? scores { score-id: score-id })
)
