(define-map audits uint {
  site-id: (string-ascii 100),
  auditor: principal,
  audit-date: uint,
  biodiversity-score: uint,
  findings: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var audit-counter uint u0)

(define-read-only (get-audit (audit-id uint))
  (map-get? audits audit-id))

(define-public (conduct-audit (site-id (string-ascii 100)) (biodiversity-score uint) (findings (string-utf8 512)))
  (let ((new-id (+ (var-get audit-counter) u1)))
    (asserts! (<= biodiversity-score u100) (err u1))
    (map-set audits new-id {
      site-id: site-id,
      auditor: tx-sender,
      audit-date: stacks-block-height,
      biodiversity-score: biodiversity-score,
      findings: findings,
      status: "completed"
    })
    (var-set audit-counter new-id)
    (ok new-id)))
