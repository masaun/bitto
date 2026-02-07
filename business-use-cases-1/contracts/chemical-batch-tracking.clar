(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map batches
  { batch-id: (string-ascii 50) }
  {
    chemical-id: (string-ascii 50),
    quantity: uint,
    unit: (string-ascii 20),
    production-date: uint,
    expiry-date: uint,
    lot-number: (string-ascii 50),
    quality-status: (string-ascii 20),
    created-by: principal,
    created-at: uint
  }
)

(define-public (create-batch (batch-id (string-ascii 50)) (chemical-id (string-ascii 50)) (quantity uint) (unit (string-ascii 20)) (production-date uint) (expiry-date uint) (lot-number (string-ascii 50)))
  (begin
    (asserts! (is-none (map-get? batches { batch-id: batch-id })) err-already-exists)
    (ok (map-set batches
      { batch-id: batch-id }
      {
        chemical-id: chemical-id,
        quantity: quantity,
        unit: unit,
        production-date: production-date,
        expiry-date: expiry-date,
        lot-number: lot-number,
        quality-status: "pending",
        created-by: tx-sender,
        created-at: stacks-block-height
      }
    ))
  )
)

(define-public (update-quality-status (batch-id (string-ascii 50)) (quality-status (string-ascii 20)))
  (let ((batch (unwrap! (map-get? batches { batch-id: batch-id }) err-not-found)))
    (ok (map-set batches
      { batch-id: batch-id }
      (merge batch { quality-status: quality-status })
    ))
  )
)

(define-public (update-quantity (batch-id (string-ascii 50)) (quantity uint))
  (let ((batch (unwrap! (map-get? batches { batch-id: batch-id }) err-not-found)))
    (asserts! (is-eq (get created-by batch) tx-sender) err-unauthorized)
    (ok (map-set batches
      { batch-id: batch-id }
      (merge batch { quantity: quantity })
    ))
  )
)

(define-read-only (get-batch (batch-id (string-ascii 50)))
  (map-get? batches { batch-id: batch-id })
)

(define-read-only (get-batch-status (batch-id (string-ascii 50)))
  (match (map-get? batches { batch-id: batch-id })
    batch (ok (get quality-status batch))
    err-not-found
  )
)
