(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map data-sources
  {source-id: uint}
  {
    source-name: (string-ascii 128),
    source-type: (string-ascii 64),
    data-provider: principal,
    active: bool,
    last-update: uint
  }
)

(define-map aggregated-reports
  {report-id: uint}
  {
    report-hash: (buff 32),
    data-sources: (list 20 uint),
    aggregator: principal,
    timestamp: uint,
    report-type: (string-ascii 64),
    verified: bool
  }
)

(define-data-var source-nonce uint u0)
(define-data-var report-nonce uint u0)

(define-read-only (get-source (source-id uint))
  (map-get? data-sources {source-id: source-id})
)

(define-read-only (get-report (report-id uint))
  (map-get? aggregated-reports {report-id: report-id})
)

(define-public (register-data-source
  (source-name (string-ascii 128))
  (source-type (string-ascii 64))
)
  (let ((source-id (var-get source-nonce)))
    (map-set data-sources {source-id: source-id}
      {
        source-name: source-name,
        source-type: source-type,
        data-provider: tx-sender,
        active: true,
        last-update: stacks-block-height
      }
    )
    (var-set source-nonce (+ source-id u1))
    (ok source-id)
  )
)

(define-public (create-aggregated-report
  (report-hash (buff 32))
  (source-list (list 20 uint))
  (report-type (string-ascii 64))
)
  (let ((report-id (var-get report-nonce)))
    (map-set aggregated-reports {report-id: report-id}
      {
        report-hash: report-hash,
        data-sources: source-list,
        aggregator: tx-sender,
        timestamp: stacks-block-height,
        report-type: report-type,
        verified: false
      }
    )
    (var-set report-nonce (+ report-id u1))
    (ok report-id)
  )
)

(define-public (verify-report (report-id uint))
  (let ((report (unwrap! (map-get? aggregated-reports {report-id: report-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set aggregated-reports {report-id: report-id}
      (merge report {verified: true})
    ))
  )
)
