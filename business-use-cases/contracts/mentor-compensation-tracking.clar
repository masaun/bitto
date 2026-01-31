(define-map compensation
  { compensation-id: uint }
  {
    mentor-id: uint,
    period-start: uint,
    period-end: uint,
    sessions-count: uint,
    amount: uint,
    paid-at: (optional uint),
    status: (string-ascii 20)
  }
)

(define-data-var compensation-nonce uint u0)

(define-public (record-compensation (mentor uint) (start uint) (end uint) (sessions uint) (amount uint))
  (let ((compensation-id (+ (var-get compensation-nonce) u1)))
    (map-set compensation
      { compensation-id: compensation-id }
      {
        mentor-id: mentor,
        period-start: start,
        period-end: end,
        sessions-count: sessions,
        amount: amount,
        paid-at: none,
        status: "pending"
      }
    )
    (var-set compensation-nonce compensation-id)
    (ok compensation-id)
  )
)

(define-public (mark-paid (compensation-id uint))
  (match (map-get? compensation { compensation-id: compensation-id })
    comp (ok (map-set compensation { compensation-id: compensation-id } (merge comp { paid-at: (some stacks-block-height), status: "paid" })))
    (err u404)
  )
)

(define-read-only (get-compensation (compensation-id uint))
  (map-get? compensation { compensation-id: compensation-id })
)
