(define-map policy-expiries-map 
  uint 
  {
    expiry-height: uint,
    renewal-required: bool,
    expired: bool
  }
)

(define-read-only (get-policy-expiry (policy-id uint))
  (map-get? policy-expiries-map policy-id)
)

(define-public (set-policy-expiry (policy-id uint) (expiry-height uint) (renewal-req bool))
  (begin
    (map-set policy-expiries-map policy-id {
      expiry-height: expiry-height,
      renewal-required: renewal-req,
      expired: false
    })
    (ok true)
  )
)

(define-read-only (is-policy-expired (policy-id uint))
  (match (map-get? policy-expiries-map policy-id)
    expiry (ok (>= stacks-block-height (get expiry-height expiry)))
    (ok false)
  )
)
