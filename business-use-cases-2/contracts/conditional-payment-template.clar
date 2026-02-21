(define-map templates 
  uint 
  {
    creator: principal,
    name: (string-ascii 64),
    conditions: (string-ascii 512),
    active: bool
  }
)

(define-data-var template-nonce uint u0)

(define-read-only (get-template (id uint))
  (map-get? templates id)
)

(define-public (create-template (name (string-ascii 64)) (conditions (string-ascii 512)))
  (let ((id (+ (var-get template-nonce) u1)))
    (map-set templates id {
      creator: tx-sender,
      name: name,
      conditions: conditions,
      active: true
    })
    (var-set template-nonce id)
    (ok id)
  )
)

(define-public (toggle-template (id uint))
  (let ((template (unwrap! (map-get? templates id) (err u1))))
    (asserts! (is-eq tx-sender (get creator template)) (err u2))
    (map-set templates id (merge template {active: (not (get active template))}))
    (ok true)
  )
)
