(define-map policy-bindings 
  {subscription-id: uint, policy-id: uint}
  {
    bound-at: uint,
    active: bool
  }
)

(define-read-only (get-policy-binding (subscription-id uint) (policy-id uint))
  (map-get? policy-bindings {subscription-id: subscription-id, policy-id: policy-id})
)

(define-public (bind-policy (subscription-id uint) (policy-id uint))
  (begin
    (map-set policy-bindings {subscription-id: subscription-id, policy-id: policy-id} {
      bound-at: stacks-block-height,
      active: true
    })
    (ok true)
  )
)
