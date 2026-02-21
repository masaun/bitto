(define-map triggers 
  uint 
  {
    name: (string-ascii 64),
    trigger-type: (string-ascii 32),
    data: (string-ascii 256),
    active: bool
  }
)

(define-data-var trigger-nonce uint u0)

(define-read-only (get-trigger (id uint))
  (map-get? triggers id)
)

(define-public (register-trigger (name (string-ascii 64)) (trigger-type (string-ascii 32)) (data (string-ascii 256)))
  (let ((id (+ (var-get trigger-nonce) u1)))
    (map-set triggers id {
      name: name,
      trigger-type: trigger-type,
      data: data,
      active: true
    })
    (var-set trigger-nonce id)
    (ok id)
  )
)

(define-public (deactivate-trigger (id uint))
  (let ((trigger (unwrap! (map-get? triggers id) (err u1))))
    (map-set triggers id (merge trigger {active: false}))
    (ok true)
  )
)
