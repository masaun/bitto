(define-map subscriptions 
  uint 
  {
    subscriber: principal,
    plan-id: uint,
    status: (string-ascii 20),
    start-height: uint,
    end-height: uint
  }
)

(define-data-var sub-nonce uint u0)

(define-read-only (get-subscription (id uint))
  (map-get? subscriptions id)
)

(define-public (register-subscription (plan-id uint) (duration uint))
  (let ((id (+ (var-get sub-nonce) u1)))
    (map-set subscriptions id {
      subscriber: tx-sender,
      plan-id: plan-id,
      status: "active",
      start-height: stacks-block-height,
      end-height: (+ stacks-block-height duration)
    })
    (var-set sub-nonce id)
    (ok id)
  )
)

(define-public (update-subscription-status (id uint) (status (string-ascii 20)))
  (let ((sub (unwrap! (map-get? subscriptions id) (err u1))))
    (asserts! (is-eq tx-sender (get subscriber sub)) (err u2))
    (map-set subscriptions id (merge sub {status: status}))
    (ok true)
  )
)
