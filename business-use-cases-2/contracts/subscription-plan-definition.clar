(define-map subscription-plans 
  uint 
  {
    name: (string-ascii 64),
    price: uint,
    duration: uint,
    features: (string-ascii 256),
    active: bool
  }
)

(define-data-var plan-nonce uint u0)

(define-read-only (get-plan (id uint))
  (map-get? subscription-plans id)
)

(define-public (create-plan (name (string-ascii 64)) (price uint) (duration uint) (features (string-ascii 256)))
  (let ((id (+ (var-get plan-nonce) u1)))
    (map-set subscription-plans id {
      name: name,
      price: price,
      duration: duration,
      features: features,
      active: true
    })
    (var-set plan-nonce id)
    (ok id)
  )
)
