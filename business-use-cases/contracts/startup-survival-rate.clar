(define-map survival-rate
  { rate-id: uint }
  {
    cohort-id: uint,
    period-months: uint,
    startups-alive: uint,
    startups-total: uint,
    survival-percentage: uint,
    calculated-at: uint
  }
)

(define-data-var rate-nonce uint u0)

(define-public (calculate-survival-rate (cohort uint) (months uint) (alive uint) (total uint))
  (let 
    (
      (rate-id (+ (var-get rate-nonce) u1))
      (percentage (/ (* alive u100) total))
    )
    (map-set survival-rate
      { rate-id: rate-id }
      {
        cohort-id: cohort,
        period-months: months,
        startups-alive: alive,
        startups-total: total,
        survival-percentage: percentage,
        calculated-at: stacks-block-height
      }
    )
    (var-set rate-nonce rate-id)
    (ok rate-id)
  )
)

(define-read-only (get-survival-rate (rate-id uint))
  (map-get? survival-rate { rate-id: rate-id })
)
