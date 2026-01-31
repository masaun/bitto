(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map work-orders
  { order-id: uint }
  {
    project-id: uint,
    assigned-to: principal,
    task-description: (string-ascii 200),
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var order-nonce uint u0)

(define-public (create-work-order (project-id uint) (assigned-to principal) (task-description (string-ascii 200)))
  (let ((order-id (+ (var-get order-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set work-orders { order-id: order-id }
      {
        project-id: project-id,
        assigned-to: assigned-to,
        task-description: task-description,
        status: "pending",
        created-at: stacks-block-height
      }
    )
    (var-set order-nonce order-id)
    (ok order-id)
  )
)

(define-public (update-work-order-status (order-id uint) (status (string-ascii 20)))
  (let ((order (unwrap! (map-get? work-orders { order-id: order-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set work-orders { order-id: order-id } (merge order { status: status }))
    (ok true)
  )
)

(define-read-only (get-work-order (order-id uint))
  (ok (map-get? work-orders { order-id: order-id }))
)

(define-read-only (get-order-count)
  (ok (var-get order-nonce))
)
