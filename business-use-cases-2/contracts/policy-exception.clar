(define-map policy-exceptions 
  uint 
  {
    policy-id: uint,
    entity: principal,
    reason: (string-ascii 256),
    granted-by: principal,
    granted-at: uint,
    expires-at: uint
  }
)

(define-data-var exception-nonce uint u0)

(define-read-only (get-exception (id uint))
  (map-get? policy-exceptions id)
)

(define-public (grant-exception (policy-id uint) (entity principal) (reason (string-ascii 256)) (expires uint))
  (let ((id (+ (var-get exception-nonce) u1)))
    (map-set policy-exceptions id {
      policy-id: policy-id,
      entity: entity,
      reason: reason,
      granted-by: tx-sender,
      granted-at: stacks-block-height,
      expires-at: expires
    })
    (var-set exception-nonce id)
    (ok id)
  )
)
