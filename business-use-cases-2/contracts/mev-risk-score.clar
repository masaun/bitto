(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map risk-scores
  { score-id: uint }
  {
    tx-hash: (buff 32),
    score: uint,
    risk-factors: (buff 256),
    timestamp: uint
  }
)

(define-data-var score-counter uint u0)

(define-read-only (get-score (score-id uint))
  (map-get? risk-scores { score-id: score-id })
)

(define-read-only (get-count)
  (ok (var-get score-counter))
)

(define-public (calculate-score (tx-hash (buff 32)) (score uint) (risk-factors (buff 256)))
  (let ((score-id (var-get score-counter)))
    (map-set risk-scores
      { score-id: score-id }
      {
        tx-hash: tx-hash,
        score: score,
        risk-factors: risk-factors,
        timestamp: stacks-block-height
      }
    )
    (var-set score-counter (+ score-id u1))
    (ok score-id)
  )
)

(define-public (update-score (score-id uint) (new-score uint))
  (let ((score-data (unwrap! (map-get? risk-scores { score-id: score-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set risk-scores
      { score-id: score-id }
      (merge score-data { score: new-score })
    )
    (ok true)
  )
)
