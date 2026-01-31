(define-map qa-tests
  { test-id: uint }
  {
    batch-id: uint,
    test-type: (string-ascii 50),
    result: (string-ascii 100),
    tested-by: principal,
    tested-at: uint,
    passed: bool
  }
)

(define-data-var test-nonce uint u0)

(define-public (record-test (batch uint) (test-type (string-ascii 50)) (result (string-ascii 100)) (passed bool))
  (let ((test-id (+ (var-get test-nonce) u1)))
    (map-set qa-tests
      { test-id: test-id }
      {
        batch-id: batch,
        test-type: test-type,
        result: result,
        tested-by: tx-sender,
        tested-at: stacks-block-height,
        passed: passed
      }
    )
    (var-set test-nonce test-id)
    (ok test-id)
  )
)

(define-read-only (get-test (test-id uint))
  (map-get? qa-tests { test-id: test-id })
)
