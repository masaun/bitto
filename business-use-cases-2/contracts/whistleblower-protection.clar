(define-map whistleblower-reports uint {
  reporter-hash: (buff 32),
  report-type: (string-ascii 50),
  report-date: uint,
  status: (string-ascii 20),
  investigation-id: uint
})

(define-data-var report-counter uint u0)

(define-read-only (get-whistleblower-report (report-id uint))
  (map-get? whistleblower-reports report-id))

(define-public (submit-whistleblower-report (reporter-hash (buff 32)) (report-type (string-ascii 50)))
  (let ((new-id (+ (var-get report-counter) u1)))
    (map-set whistleblower-reports new-id {
      reporter-hash: reporter-hash,
      report-type: report-type,
      report-date: stacks-block-height,
      status: "received",
      investigation-id: u0
    })
    (var-set report-counter new-id)
    (ok new-id)))

(define-public (update-investigation (report-id uint) (investigation-id uint) (status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? whistleblower-reports report-id)) (err u1))
    (ok (map-set whistleblower-reports report-id (merge (unwrap-panic (map-get? whistleblower-reports report-id)) { 
      investigation-id: investigation-id,
      status: status
    })))))
