(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map deliveries
  { delivery-id: uint }
  {
    material-id: uint,
    destination: (string-ascii 100),
    status: (string-ascii 20),
    scheduled-at: uint,
    delivered-at: uint
  }
)

(define-data-var delivery-nonce uint u0)

(define-public (schedule-delivery (material-id uint) (destination (string-ascii 100)))
  (let ((delivery-id (+ (var-get delivery-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set deliveries { delivery-id: delivery-id }
      {
        material-id: material-id,
        destination: destination,
        status: "scheduled",
        scheduled-at: stacks-block-height,
        delivered-at: u0
      }
    )
    (var-set delivery-nonce delivery-id)
    (ok delivery-id)
  )
)

(define-public (complete-delivery (delivery-id uint))
  (let ((delivery (unwrap! (map-get? deliveries { delivery-id: delivery-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set deliveries { delivery-id: delivery-id }
      (merge delivery { status: "delivered", delivered-at: stacks-block-height })
    )
    (ok true)
  )
)

(define-read-only (get-delivery (delivery-id uint))
  (ok (map-get? deliveries { delivery-id: delivery-id }))
)

(define-read-only (get-delivery-count)
  (ok (var-get delivery-nonce))
)
