(define-map investment-terms
  { terms-id: uint }
  {
    startup-id: uint,
    investment-amount: uint,
    equity-percentage: uint,
    valuation-cap: uint,
    discount-rate: uint,
    terms-hash: (buff 32),
    signed-at: uint
  }
)

(define-data-var terms-nonce uint u0)

(define-public (set-investment-terms (startup uint) (amount uint) (equity uint) (cap uint) (discount uint) (hash (buff 32)))
  (let ((terms-id (+ (var-get terms-nonce) u1)))
    (map-set investment-terms
      { terms-id: terms-id }
      {
        startup-id: startup,
        investment-amount: amount,
        equity-percentage: equity,
        valuation-cap: cap,
        discount-rate: discount,
        terms-hash: hash,
        signed-at: stacks-block-height
      }
    )
    (var-set terms-nonce terms-id)
    (ok terms-id)
  )
)

(define-read-only (get-investment-terms (terms-id uint))
  (map-get? investment-terms { terms-id: terms-id })
)
