(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map aid-data-reports
  {report-id: uint}
  {
    program-id: uint,
    reporter: principal,
    data-hash: (buff 32),
    metrics: (string-ascii 512),
    timestamp: uint,
    verified: bool
  }
)

(define-map analytics-queries
  {query-id: uint}
  {
    requester: principal,
    query-hash: (buff 32),
    result-hash: (optional (buff 32)),
    created-at: uint,
    completed-at: (optional uint)
  }
)

(define-data-var report-nonce uint u0)
(define-data-var query-nonce uint u0)

(define-read-only (get-report (report-id uint))
  (map-get? aid-data-reports {report-id: report-id})
)

(define-read-only (get-query (query-id uint))
  (map-get? analytics-queries {query-id: query-id})
)

(define-public (submit-report
  (program-id uint)
  (data-hash (buff 32))
  (metrics (string-ascii 512))
)
  (let ((report-id (var-get report-nonce)))
    (map-set aid-data-reports {report-id: report-id}
      {
        program-id: program-id,
        reporter: tx-sender,
        data-hash: data-hash,
        metrics: metrics,
        timestamp: stacks-block-height,
        verified: false
      }
    )
    (var-set report-nonce (+ report-id u1))
    (ok report-id)
  )
)

(define-public (verify-report (report-id uint))
  (let ((report (unwrap! (map-get? aid-data-reports {report-id: report-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set aid-data-reports {report-id: report-id}
      (merge report {verified: true})
    ))
  )
)

(define-public (submit-analytics-query (query-hash (buff 32)))
  (let ((query-id (var-get query-nonce)))
    (map-set analytics-queries {query-id: query-id}
      {
        requester: tx-sender,
        query-hash: query-hash,
        result-hash: none,
        created-at: stacks-block-height,
        completed-at: none
      }
    )
    (var-set query-nonce (+ query-id u1))
    (ok query-id)
  )
)

(define-public (complete-query (query-id uint) (result-hash (buff 32)))
  (let ((query (unwrap! (map-get? analytics-queries {query-id: query-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set analytics-queries {query-id: query-id}
      (merge query {
        result-hash: (some result-hash),
        completed-at: (some stacks-block-height)
      })
    ))
  )
)
