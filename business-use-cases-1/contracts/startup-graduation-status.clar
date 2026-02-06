(define-map graduation-status
  { graduation-id: uint }
  {
    startup-id: uint,
    cohort-id: uint,
    graduation-date: uint,
    final-valuation: uint,
    status: (string-ascii 20),
    notes: (string-ascii 200)
  }
)

(define-data-var graduation-nonce uint u0)

(define-public (record-graduation (startup uint) (cohort uint) (graduation-date uint) (valuation uint) (notes (string-ascii 200)))
  (let ((graduation-id (+ (var-get graduation-nonce) u1)))
    (map-set graduation-status
      { graduation-id: graduation-id }
      {
        startup-id: startup,
        cohort-id: cohort,
        graduation-date: graduation-date,
        final-valuation: valuation,
        status: "graduated",
        notes: notes
      }
    )
    (var-set graduation-nonce graduation-id)
    (ok graduation-id)
  )
)

(define-read-only (get-graduation (graduation-id uint))
  (map-get? graduation-status { graduation-id: graduation-id })
)
