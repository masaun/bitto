(define-map batches (string-ascii 100) {
  origin: (string-ascii 100),
  material-type: (string-ascii 50),
  quantity: uint,
  creation-date: uint,
  current-holder: principal
})

(define-read-only (get-batch (batch-id (string-ascii 100)))
  (map-get? batches batch-id))

(define-public (create-batch (batch-id (string-ascii 100)) (origin (string-ascii 100)) (material-type (string-ascii 50)) (quantity uint))
  (begin
    (asserts! (is-none (map-get? batches batch-id)) (err u1))
    (ok (map-set batches batch-id {
      origin: origin,
      material-type: material-type,
      quantity: quantity,
      creation-date: stacks-block-height,
      current-holder: tx-sender
    }))))
