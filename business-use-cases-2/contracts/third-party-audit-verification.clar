(define-map verifications uint {
  entity: principal,
  auditor: principal,
  audit-type: (string-ascii 50),
  audit-date: uint,
  findings: (string-utf8 512),
  verification-score: uint,
  status: (string-ascii 20)
})

(define-data-var verification-counter uint u0)

(define-read-only (get-verification (verification-id uint))
  (map-get? verifications verification-id))

(define-public (submit-verification (entity principal) (audit-type (string-ascii 50)) (findings (string-utf8 512)) (verification-score uint))
  (let ((new-id (+ (var-get verification-counter) u1)))
    (asserts! (<= verification-score u100) (err u1))
    (map-set verifications new-id {
      entity: entity,
      auditor: tx-sender,
      audit-type: audit-type,
      audit-date: stacks-block-height,
      findings: findings,
      verification-score: verification-score,
      status: "verified"
    })
    (var-set verification-counter new-id)
    (ok new-id)))
