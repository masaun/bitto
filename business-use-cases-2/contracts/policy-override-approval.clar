(define-map override-approvals 
  uint 
  {
    policy-id: uint,
    requester: principal,
    approver: principal,
    approved: bool,
    timestamp: uint
  }
)

(define-data-var override-nonce uint u0)

(define-read-only (get-override (id uint))
  (map-get? override-approvals id)
)

(define-public (request-override (policy-id uint))
  (let ((id (+ (var-get override-nonce) u1)))
    (map-set override-approvals id {
      policy-id: policy-id,
      requester: tx-sender,
      approver: tx-sender,
      approved: false,
      timestamp: stacks-block-height
    })
    (var-set override-nonce id)
    (ok id)
  )
)

(define-public (approve-override (id uint))
  (let ((override (unwrap! (map-get? override-approvals id) (err u1))))
    (map-set override-approvals id (merge override {approved: true, approver: tx-sender}))
    (ok true)
  )
)
