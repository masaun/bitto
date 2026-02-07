(define-map impact-reports uint {
  operator: principal,
  project-id: (string-ascii 100),
  report-period: uint,
  impact-score: uint,
  mitigation-measures: (string-utf8 512),
  timestamp: uint
})

(define-data-var report-counter uint u0)

(define-read-only (get-impact-report (report-id uint))
  (map-get? impact-reports report-id))

(define-public (submit-impact-report (project-id (string-ascii 100)) (report-period uint) (impact-score uint) (mitigation-measures (string-utf8 512)))
  (let ((new-id (+ (var-get report-counter) u1)))
    (asserts! (<= impact-score u100) (err u1))
    (map-set impact-reports new-id {
      operator: tx-sender,
      project-id: project-id,
      report-period: report-period,
      impact-score: impact-score,
      mitigation-measures: mitigation-measures,
      timestamp: stacks-block-height
    })
    (var-set report-counter new-id)
    (ok new-id)))
