(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map drone-ops
  { operation-id: uint }
  {
    drone-id: uint,
    mission-type: (string-ascii 50),
    status: (string-ascii 20),
    started-at: uint,
    completed-at: uint
  }
)

(define-data-var ops-nonce uint u0)

(define-public (start-operation (drone-id uint) (mission-type (string-ascii 50)))
  (let ((operation-id (+ (var-get ops-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set drone-ops { operation-id: operation-id }
      {
        drone-id: drone-id,
        mission-type: mission-type,
        status: "active",
        started-at: stacks-block-height,
        completed-at: u0
      }
    )
    (var-set ops-nonce operation-id)
    (ok operation-id)
  )
)

(define-public (complete-operation (operation-id uint))
  (let ((op (unwrap! (map-get? drone-ops { operation-id: operation-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set drone-ops { operation-id: operation-id }
      (merge op { status: "completed", completed-at: stacks-block-height })
    )
    (ok true)
  )
)

(define-read-only (get-operation (operation-id uint))
  (ok (map-get? drone-ops { operation-id: operation-id }))
)

(define-read-only (get-ops-count)
  (ok (var-get ops-nonce))
)
