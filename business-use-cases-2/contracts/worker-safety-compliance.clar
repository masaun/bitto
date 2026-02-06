(define-map compliance-records uint {
  operator: principal,
  site-id: (string-ascii 100),
  inspection-date: uint,
  compliance-score: uint,
  violations: (string-utf8 256),
  status: (string-ascii 20)
})

(define-data-var record-counter uint u0)
(define-data-var safety-inspector principal tx-sender)

(define-read-only (get-compliance-record (record-id uint))
  (map-get? compliance-records record-id))

(define-public (record-inspection (operator principal) (site-id (string-ascii 100)) (compliance-score uint) (violations (string-utf8 256)))
  (let ((new-id (+ (var-get record-counter) u1)))
    (asserts! (is-eq tx-sender (var-get safety-inspector)) (err u1))
    (asserts! (<= compliance-score u100) (err u2))
    (map-set compliance-records new-id {
      operator: operator,
      site-id: site-id,
      inspection-date: stacks-block-height,
      compliance-score: compliance-score,
      violations: violations,
      status: "reviewed"
    })
    (var-set record-counter new-id)
    (ok new-id)))
