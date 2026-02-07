(define-map follow-on-investments
  { investment-id: uint }
  {
    startup-id: uint,
    investor-id: uint,
    round-name: (string-ascii 50),
    amount: uint,
    invested-at: uint,
    valuation: uint
  }
)

(define-data-var investment-nonce uint u0)

(define-public (record-follow-on (startup uint) (investor uint) (round (string-ascii 50)) (amount uint) (valuation uint))
  (let ((investment-id (+ (var-get investment-nonce) u1)))
    (map-set follow-on-investments
      { investment-id: investment-id }
      {
        startup-id: startup,
        investor-id: investor,
        round-name: round,
        amount: amount,
        invested-at: stacks-block-height,
        valuation: valuation
      }
    )
    (var-set investment-nonce investment-id)
    (ok investment-id)
  )
)

(define-read-only (get-follow-on-investment (investment-id uint))
  (map-get? follow-on-investments { investment-id: investment-id })
)
