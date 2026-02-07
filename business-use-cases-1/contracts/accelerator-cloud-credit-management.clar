(define-map cloud-credits
  { credit-id: uint }
  {
    startup-id: uint,
    provider: (string-ascii 50),
    credit-amount: uint,
    issued-at: uint,
    expiry: uint,
    used-amount: uint
  }
)

(define-data-var credit-nonce uint u0)

(define-public (issue-cloud-credits (startup uint) (provider (string-ascii 50)) (amount uint) (expiry uint))
  (let ((credit-id (+ (var-get credit-nonce) u1)))
    (map-set cloud-credits
      { credit-id: credit-id }
      {
        startup-id: startup,
        provider: provider,
        credit-amount: amount,
        issued-at: stacks-block-height,
        expiry: expiry,
        used-amount: u0
      }
    )
    (var-set credit-nonce credit-id)
    (ok credit-id)
  )
)

(define-public (update-usage (credit-id uint) (used uint))
  (match (map-get? cloud-credits { credit-id: credit-id })
    credit (ok (map-set cloud-credits { credit-id: credit-id } (merge credit { used-amount: used })))
    (err u404)
  )
)

(define-read-only (get-cloud-credit (credit-id uint))
  (map-get? cloud-credits { credit-id: credit-id })
)
