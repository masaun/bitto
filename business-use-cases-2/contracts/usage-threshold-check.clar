(define-map usage-thresholds 
  uint 
  {
    subscription-id: uint,
    threshold: uint,
    current-usage: uint,
    exceeded: bool
  }
)

(define-read-only (get-threshold (subscription-id uint))
  (map-get? usage-thresholds subscription-id)
)

(define-public (set-threshold (subscription-id uint) (threshold uint))
  (begin
    (map-set usage-thresholds subscription-id {
      subscription-id: subscription-id,
      threshold: threshold,
      current-usage: u0,
      exceeded: false
    })
    (ok true)
  )
)

(define-public (increment-usage (subscription-id uint) (amount uint))
  (let ((thresh (unwrap! (map-get? usage-thresholds subscription-id) (err u1))))
    (let ((new-usage (+ (get current-usage thresh) amount)))
      (map-set usage-thresholds subscription-id (merge thresh {
        current-usage: new-usage,
        exceeded: (>= new-usage (get threshold thresh))
      }))
      (ok true)
    )
  )
)
