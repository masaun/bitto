(define-map incidents uint {
  reporter: principal,
  site-id: (string-ascii 100),
  incident-type: (string-ascii 50),
  severity: (string-ascii 20),
  report-date: uint,
  description: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var incident-counter uint u0)

(define-read-only (get-incident (incident-id uint))
  (map-get? incidents incident-id))

(define-public (report-incident (site-id (string-ascii 100)) (incident-type (string-ascii 50)) (severity (string-ascii 20)) (description (string-utf8 512)))
  (let ((new-id (+ (var-get incident-counter) u1)))
    (map-set incidents new-id {
      reporter: tx-sender,
      site-id: site-id,
      incident-type: incident-type,
      severity: severity,
      report-date: stacks-block-height,
      description: description,
      status: "under-investigation"
    })
    (var-set incident-counter new-id)
    (ok new-id)))

(define-public (update-incident-status (incident-id uint) (status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? incidents incident-id)) (err u1))
    (ok (map-set incidents incident-id (merge (unwrap-panic (map-get? incidents incident-id)) { status: status })))))
