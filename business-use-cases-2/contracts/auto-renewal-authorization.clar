(define-map renewal-authorizations 
  uint 
  {
    subscription-id: uint,
    authorized: bool,
    authorized-by: principal,
    authorized-at: uint
  }
)

(define-data-var renewal-auth-nonce uint u0)

(define-read-only (get-renewal-auth (id uint))
  (map-get? renewal-authorizations id)
)

(define-public (authorize-renewal (subscription-id uint))
  (let ((id (+ (var-get renewal-auth-nonce) u1)))
    (map-set renewal-authorizations id {
      subscription-id: subscription-id,
      authorized: true,
      authorized-by: tx-sender,
      authorized-at: stacks-block-height
    })
    (var-set renewal-auth-nonce id)
    (ok id)
  )
)
