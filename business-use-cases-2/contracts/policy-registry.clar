(define-map policies 
  uint 
  {
    name: (string-ascii 128),
    description: (string-ascii 512),
    active: bool,
    created-at: uint
  }
)

(define-data-var policy-nonce uint u0)

(define-read-only (get-policy (id uint))
  (map-get? policies id)
)

(define-public (register-policy (name (string-ascii 128)) (description (string-ascii 512)))
  (let ((id (+ (var-get policy-nonce) u1)))
    (map-set policies id {
      name: name,
      description: description,
      active: true,
      created-at: stacks-block-height
    })
    (var-set policy-nonce id)
    (ok id)
  )
)

(define-public (toggle-policy (id uint))
  (let ((policy (unwrap! (map-get? policies id) (err u1))))
    (map-set policies id (merge policy {active: (not (get active policy))}))
    (ok true)
  )
)
