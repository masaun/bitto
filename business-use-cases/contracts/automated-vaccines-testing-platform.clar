(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map vaccine-tests
  {test-id: uint}
  {
    vaccine-name: (string-ascii 128),
    test-phase: (string-ascii 16),
    researcher: principal,
    data-hash: (buff 32),
    participants-count: uint,
    status: (string-ascii 32),
    started-at: uint,
    completed-at: (optional uint)
  }
)

(define-map test-results
  {result-id: uint}
  {
    test-id: uint,
    efficacy-rate: uint,
    safety-score: uint,
    result-hash: (buff 32),
    verified-by: (optional principal),
    timestamp: uint
  }
)

(define-data-var test-nonce uint u0)
(define-data-var result-nonce uint u0)

(define-read-only (get-test (test-id uint))
  (map-get? vaccine-tests {test-id: test-id})
)

(define-read-only (get-result (result-id uint))
  (map-get? test-results {result-id: result-id})
)

(define-public (register-vaccine-test
  (vaccine-name (string-ascii 128))
  (test-phase (string-ascii 16))
  (participants-count uint)
  (data-hash (buff 32))
)
  (let ((test-id (var-get test-nonce)))
    (asserts! (> participants-count u0) err-invalid-params)
    (map-set vaccine-tests {test-id: test-id}
      {
        vaccine-name: vaccine-name,
        test-phase: test-phase,
        researcher: tx-sender,
        data-hash: data-hash,
        participants-count: participants-count,
        status: "ongoing",
        started-at: stacks-block-height,
        completed-at: none
      }
    )
    (var-set test-nonce (+ test-id u1))
    (ok test-id)
  )
)

(define-public (submit-test-results
  (test-id uint)
  (efficacy-rate uint)
  (safety-score uint)
  (result-hash (buff 32))
)
  (let (
    (test (unwrap! (map-get? vaccine-tests {test-id: test-id}) err-not-found))
    (result-id (var-get result-nonce))
  )
    (asserts! (is-eq tx-sender (get researcher test)) err-unauthorized)
    (map-set test-results {result-id: result-id}
      {
        test-id: test-id,
        efficacy-rate: efficacy-rate,
        safety-score: safety-score,
        result-hash: result-hash,
        verified-by: none,
        timestamp: stacks-block-height
      }
    )
    (map-set vaccine-tests {test-id: test-id}
      (merge test {status: "completed", completed-at: (some stacks-block-height)})
    )
    (var-set result-nonce (+ result-id u1))
    (ok result-id)
  )
)

(define-public (verify-results (result-id uint))
  (let ((result (unwrap! (map-get? test-results {result-id: result-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set test-results {result-id: result-id}
      (merge result {verified-by: (some tx-sender)})
    ))
  )
)
