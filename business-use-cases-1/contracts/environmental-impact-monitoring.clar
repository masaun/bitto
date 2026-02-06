(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map environmental-monitoring
  { project-id: uint, report-id: uint }
  {
    metric-type: (string-ascii 50),
    value: uint,
    recorded-at: uint
  }
)

(define-public (record-environmental-metric (project-id uint) (report-id uint) (metric-type (string-ascii 50)) (value uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set environmental-monitoring { project-id: project-id, report-id: report-id }
      { metric-type: metric-type, value: value, recorded-at: stacks-block-height }
    )
    (ok true)
  )
)

(define-read-only (get-environmental-metric (project-id uint) (report-id uint))
  (ok (map-get? environmental-monitoring { project-id: project-id, report-id: report-id }))
)
