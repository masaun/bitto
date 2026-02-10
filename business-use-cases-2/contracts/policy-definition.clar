(define-map policy-definitions 
  uint 
  {
    policy-id: uint,
    rules: (string-ascii 512),
    scope: (string-ascii 64),
    defined-by: principal,
    defined-at: uint
  }
)

(define-data-var def-nonce uint u0)

(define-read-only (get-definition (id uint))
  (map-get? policy-definitions id)
)

(define-public (define-policy (policy-id uint) (rules (string-ascii 512)) (scope (string-ascii 64)))
  (let ((id (+ (var-get def-nonce) u1)))
    (map-set policy-definitions id {
      policy-id: policy-id,
      rules: rules,
      scope: scope,
      defined-by: tx-sender,
      defined-at: stacks-block-height
    })
    (var-set def-nonce id)
    (ok id)
  )
)
