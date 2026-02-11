(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map orderflows
  { flow-id: uint }
  {
    encrypted-order: (buff 1024),
    priority: uint,
    status: (string-ascii 20),
    submitter: principal
  }
)

(define-data-var flow-counter uint u0)

(define-read-only (get-orderflow (flow-id uint))
  (map-get? orderflows { flow-id: flow-id })
)

(define-read-only (get-count)
  (ok (var-get flow-counter))
)

(define-public (submit-order (encrypted-order (buff 1024)) (priority uint))
  (let ((flow-id (var-get flow-counter)))
    (map-set orderflows
      { flow-id: flow-id }
      {
        encrypted-order: encrypted-order,
        priority: priority,
        status: "pending",
        submitter: tx-sender
      }
    )
    (var-set flow-counter (+ flow-id u1))
    (ok flow-id)
  )
)

(define-public (update-order-status (flow-id uint) (new-status (string-ascii 20)))
  (let ((flow-data (unwrap! (map-get? orderflows { flow-id: flow-id }) err-not-found)))
    (asserts! (is-eq (get submitter flow-data) tx-sender) err-owner-only)
    (map-set orderflows
      { flow-id: flow-id }
      (merge flow-data { status: new-status })
    )
    (ok true)
  )
)
