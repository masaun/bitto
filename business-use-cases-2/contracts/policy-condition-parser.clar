(define-map parsed-conditions 
  uint 
  {
    policy-id: uint,
    condition: (string-ascii 256),
    operator: (string-ascii 16),
    value: uint,
    parsed-at: uint
  }
)

(define-data-var parse-nonce uint u0)

(define-read-only (get-parsed-condition (id uint))
  (map-get? parsed-conditions id)
)

(define-public (parse-condition (policy-id uint) (condition (string-ascii 256)) (operator (string-ascii 16)) (value uint))
  (let ((id (+ (var-get parse-nonce) u1)))
    (map-set parsed-conditions id {
      policy-id: policy-id,
      condition: condition,
      operator: operator,
      value: value,
      parsed-at: stacks-block-height
    })
    (var-set parse-nonce id)
    (ok id)
  )
)
