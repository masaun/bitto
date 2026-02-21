(define-map renewal-conditions 
  uint 
  {
    subscription-id: uint,
    auto-renew: bool,
    conditions-met: bool,
    last-check: uint
  }
)

(define-read-only (get-renewal-condition (subscription-id uint))
  (map-get? renewal-conditions subscription-id)
)

(define-public (set-renewal-conditions (subscription-id uint) (auto-renew bool))
  (begin
    (map-set renewal-conditions subscription-id {
      subscription-id: subscription-id,
      auto-renew: auto-renew,
      conditions-met: false,
      last-check: stacks-block-height
    })
    (ok true)
  )
)

(define-public (check-renewal-conditions (subscription-id uint))
  (let ((cond (unwrap! (map-get? renewal-conditions subscription-id) (err u1))))
    (map-set renewal-conditions subscription-id (merge cond {
      conditions-met: true,
      last-check: stacks-block-height
    }))
    (ok true)
  )
)
