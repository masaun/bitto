(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map test-records
  { test-id: uint }
  {
    system-id: uint,
    test-type: (string-ascii 50),
    result: (string-ascii 20),
    conducted-at: uint
  }
)

(define-data-var test-nonce uint u0)

(define-public (record-test (system-id uint) (test-type (string-ascii 50)) (result (string-ascii 20)))
  (let ((test-id (+ (var-get test-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set test-records { test-id: test-id }
      {
        system-id: system-id,
        test-type: test-type,
        result: result,
        conducted-at: stacks-block-height
      }
    )
    (var-set test-nonce test-id)
    (ok test-id)
  )
)

(define-read-only (get-test-record (test-id uint))
  (ok (map-get? test-records { test-id: test-id }))
)

(define-read-only (get-test-count)
  (ok (var-get test-nonce))
)
