(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))

(define-map qc-tests
  { test-id: (string-ascii 50) }
  {
    batch-id: (string-ascii 50),
    test-type: (string-ascii 50),
    test-result: (string-ascii 20),
    test-value: uint,
    tested-by: principal,
    tested-at: uint,
    approved: bool
  }
)

(define-public (record-qc-test (test-id (string-ascii 50)) (batch-id (string-ascii 50)) (test-type (string-ascii 50)) (test-result (string-ascii 20)) (test-value uint))
  (begin
    (asserts! (is-none (map-get? qc-tests { test-id: test-id })) err-already-exists)
    (ok (map-set qc-tests
      { test-id: test-id }
      {
        batch-id: batch-id,
        test-type: test-type,
        test-result: test-result,
        test-value: test-value,
        tested-by: tx-sender,
        tested-at: stacks-block-height,
        approved: false
      }
    ))
  )
)

(define-public (approve-test (test-id (string-ascii 50)))
  (let ((test (unwrap! (map-get? qc-tests { test-id: test-id }) err-not-found)))
    (ok (map-set qc-tests
      { test-id: test-id }
      (merge test { approved: true })
    ))
  )
)

(define-read-only (get-qc-test (test-id (string-ascii 50)))
  (map-get? qc-tests { test-id: test-id })
)
