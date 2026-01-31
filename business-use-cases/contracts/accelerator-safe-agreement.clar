(define-map safe-agreements
  { safe-id: uint }
  {
    startup-id: uint,
    investor: principal,
    investment-amount: uint,
    valuation-cap: uint,
    discount-rate: uint,
    issued-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var safe-nonce uint u0)

(define-public (issue-safe (startup uint) (investor principal) (amount uint) (cap uint) (discount uint))
  (let ((safe-id (+ (var-get safe-nonce) u1)))
    (map-set safe-agreements
      { safe-id: safe-id }
      {
        startup-id: startup,
        investor: investor,
        investment-amount: amount,
        valuation-cap: cap,
        discount-rate: discount,
        issued-at: stacks-block-height,
        status: "active"
      }
    )
    (var-set safe-nonce safe-id)
    (ok safe-id)
  )
)

(define-read-only (get-safe (safe-id uint))
  (map-get? safe-agreements { safe-id: safe-id })
)
