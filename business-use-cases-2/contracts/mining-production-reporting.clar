(define-map production-reports uint {
  operator: principal,
  period: uint,
  quantity: uint,
  material-type: (string-ascii 50),
  report-date: uint
})

(define-data-var report-counter uint u0)

(define-read-only (get-report (report-id uint))
  (map-get? production-reports report-id))

(define-public (submit-report (period uint) (quantity uint) (material-type (string-ascii 50)))
  (let ((new-id (+ (var-get report-counter) u1)))
    (map-set production-reports new-id {
      operator: tx-sender,
      period: period,
      quantity: quantity,
      material-type: material-type,
      report-date: stacks-block-height
    })
    (var-set report-counter new-id)
    (ok new-id)))
