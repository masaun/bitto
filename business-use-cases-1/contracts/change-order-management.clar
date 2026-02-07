(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map change-orders
  { change-order-id: uint }
  {
    project-id: uint,
    description: (string-ascii 200),
    cost-impact: uint,
    approved: bool,
    submitted-at: uint
  }
)

(define-data-var change-order-nonce uint u0)

(define-public (submit-change-order (project-id uint) (description (string-ascii 200)) (cost-impact uint))
  (let ((change-order-id (+ (var-get change-order-nonce) u1)))
    (map-set change-orders { change-order-id: change-order-id }
      {
        project-id: project-id,
        description: description,
        cost-impact: cost-impact,
        approved: false,
        submitted-at: stacks-block-height
      }
    )
    (var-set change-order-nonce change-order-id)
    (ok change-order-id)
  )
)

(define-public (approve-change-order (change-order-id uint))
  (let ((change-order (unwrap! (map-get? change-orders { change-order-id: change-order-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set change-orders { change-order-id: change-order-id } (merge change-order { approved: true }))
    (ok true)
  )
)

(define-read-only (get-change-order (change-order-id uint))
  (ok (map-get? change-orders { change-order-id: change-order-id }))
)

(define-read-only (get-change-order-count)
  (ok (var-get change-order-nonce))
)
