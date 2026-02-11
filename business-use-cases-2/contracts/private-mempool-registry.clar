(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map mempool-entries
  { entry-id: uint }
  {
    encrypted-tx: (buff 2048),
    priority: uint,
    submitter: principal,
    timestamp: uint
  }
)

(define-data-var entry-counter uint u0)

(define-read-only (get-entry (entry-id uint))
  (map-get? mempool-entries { entry-id: entry-id })
)

(define-read-only (get-entry-count)
  (ok (var-get entry-counter))
)

(define-public (add-entry (encrypted-tx (buff 2048)) (priority uint))
  (let ((entry-id (var-get entry-counter)))
    (map-set mempool-entries
      { entry-id: entry-id }
      {
        encrypted-tx: encrypted-tx,
        priority: priority,
        submitter: tx-sender,
        timestamp: stacks-block-height
      }
    )
    (var-set entry-counter (+ entry-id u1))
    (ok entry-id)
  )
)

(define-public (remove-entry (entry-id uint))
  (let ((entry-data (unwrap! (map-get? mempool-entries { entry-id: entry-id }) err-not-found)))
    (asserts! (is-eq (get submitter entry-data) tx-sender) err-owner-only)
    (map-delete mempool-entries { entry-id: entry-id })
    (ok true)
  )
)
