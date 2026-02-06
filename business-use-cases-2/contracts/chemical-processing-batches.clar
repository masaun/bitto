(define-map batches (string-ascii 100) {
  processor: principal,
  input-quantity: uint,
  output-quantity: uint,
  process-date: uint,
  status: (string-ascii 20)
})

(define-read-only (get-batch (batch-id (string-ascii 100)))
  (map-get? batches batch-id))

(define-public (register-batch (batch-id (string-ascii 100)) (input-quantity uint) (output-quantity uint))
  (begin
    (asserts! (is-none (map-get? batches batch-id)) (err u1))
    (ok (map-set batches batch-id {
      processor: tx-sender,
      input-quantity: input-quantity,
      output-quantity: output-quantity,
      process-date: stacks-block-height,
      status: "processed"
    }))))

(define-public (update-batch-status (batch-id (string-ascii 100)) (status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? batches batch-id)) (err u2))
    (let ((batch (unwrap-panic (map-get? batches batch-id))))
      (asserts! (is-eq tx-sender (get processor batch)) (err u1))
      (ok (map-set batches batch-id (merge batch { status: status }))))))
