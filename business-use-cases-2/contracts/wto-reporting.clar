(define-map wto-reports uint {
  reporting-entity: principal,
  report-period: uint,
  trade-volume: uint,
  report-date: uint,
  status: (string-ascii 20)
})

(define-data-var report-counter uint u0)

(define-read-only (get-wto-report (report-id uint))
  (map-get? wto-reports report-id))

(define-public (submit-wto-report (report-period uint) (trade-volume uint))
  (let ((new-id (+ (var-get report-counter) u1)))
    (map-set wto-reports new-id {
      reporting-entity: tx-sender,
      report-period: report-period,
      trade-volume: trade-volume,
      report-date: stacks-block-height,
      status: "submitted"
    })
    (var-set report-counter new-id)
    (ok new-id)))
