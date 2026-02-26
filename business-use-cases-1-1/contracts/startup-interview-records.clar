(define-map interviews
  { interview-id: uint }
  {
    application-id: uint,
    interviewer: principal,
    interview-date: uint,
    notes: (string-ascii 500),
    recommendation: (string-ascii 20),
    recorded-at: uint
  }
)

(define-data-var interview-nonce uint u0)

(define-public (record-interview (application uint) (interview-date uint) (notes (string-ascii 500)) (recommendation (string-ascii 20)))
  (let ((interview-id (+ (var-get interview-nonce) u1)))
    (map-set interviews
      { interview-id: interview-id }
      {
        application-id: application,
        interviewer: tx-sender,
        interview-date: interview-date,
        notes: notes,
        recommendation: recommendation,
        recorded-at: stacks-block-height
      }
    )
    (var-set interview-nonce interview-id)
    (ok interview-id)
  )
)

(define-read-only (get-interview (interview-id uint))
  (map-get? interviews { interview-id: interview-id })
)
