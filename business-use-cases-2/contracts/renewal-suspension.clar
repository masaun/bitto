(define-map suspensions 
  uint 
  {
    subscription-id: uint,
    reason: (string-ascii 256),
    suspended-by: principal,
    suspended-at: uint,
    active: bool
  }
)

(define-data-var suspension-nonce uint u0)

(define-read-only (get-suspension (id uint))
  (map-get? suspensions id)
)

(define-public (suspend-renewal (subscription-id uint) (reason (string-ascii 256)))
  (let ((id (+ (var-get suspension-nonce) u1)))
    (map-set suspensions id {
      subscription-id: subscription-id,
      reason: reason,
      suspended-by: tx-sender,
      suspended-at: stacks-block-height,
      active: true
    })
    (var-set suspension-nonce id)
    (ok id)
  )
)
