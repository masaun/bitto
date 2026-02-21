(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map executions
  { execution-id: uint }
  {
    encrypted-input: (buff 1024),
    result-hash: (optional (buff 32)),
    status: (string-ascii 20),
    executor: principal
  }
)

(define-data-var execution-counter uint u0)

(define-read-only (get-execution (execution-id uint))
  (map-get? executions { execution-id: execution-id })
)

(define-read-only (get-execution-count)
  (ok (var-get execution-counter))
)

(define-public (submit-execution (encrypted-input (buff 1024)))
  (let ((execution-id (var-get execution-counter)))
    (map-set executions
      { execution-id: execution-id }
      {
        encrypted-input: encrypted-input,
        result-hash: none,
        status: "pending",
        executor: tx-sender
      }
    )
    (var-set execution-counter (+ execution-id u1))
    (ok execution-id)
  )
)

(define-public (finalize-execution (execution-id uint) (result-hash (buff 32)))
  (let ((exec-data (unwrap! (map-get? executions { execution-id: execution-id }) err-not-found)))
    (asserts! (is-eq (get executor exec-data) tx-sender) err-owner-only)
    (map-set executions
      { execution-id: execution-id }
      (merge exec-data { result-hash: (some result-hash), status: "completed" })
    )
    (ok true)
  )
)
