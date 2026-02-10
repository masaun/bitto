(define-map authorizations 
  uint 
  {
    execution-id: uint,
    authorizer: principal,
    authorized: bool,
    timestamp: uint
  }
)

(define-data-var auth-nonce uint u0)

(define-read-only (get-authorization (id uint))
  (map-get? authorizations id)
)

(define-public (authorize-execution (execution-id uint))
  (let ((id (+ (var-get auth-nonce) u1)))
    (map-set authorizations id {
      execution-id: execution-id,
      authorizer: tx-sender,
      authorized: true,
      timestamp: stacks-block-height
    })
    (var-set auth-nonce id)
    (ok id)
  )
)
