(define-map program-performance
  { performance-id: uint }
  {
    program-id: uint,
    cohort-id: uint,
    startups-accepted: uint,
    startups-graduated: uint,
    total-funding-raised: uint,
    reported-at: uint
  }
)

(define-data-var performance-nonce uint u0)

(define-public (record-performance (program uint) (cohort uint) (accepted uint) (graduated uint) (funding uint))
  (let ((performance-id (+ (var-get performance-nonce) u1)))
    (map-set program-performance
      { performance-id: performance-id }
      {
        program-id: program,
        cohort-id: cohort,
        startups-accepted: accepted,
        startups-graduated: graduated,
        total-funding-raised: funding,
        reported-at: stacks-block-height
      }
    )
    (var-set performance-nonce performance-id)
    (ok performance-id)
  )
)

(define-read-only (get-program-performance (performance-id uint))
  (map-get? program-performance { performance-id: performance-id })
)
