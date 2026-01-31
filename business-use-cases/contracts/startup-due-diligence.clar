(define-map due-diligence
  { dd-id: uint }
  {
    application-id: uint,
    reviewer: principal,
    category: (string-ascii 50),
    findings: (string-ascii 500),
    risk-level: (string-ascii 20),
    completed-at: uint
  }
)

(define-data-var dd-nonce uint u0)

(define-public (record-due-diligence (application uint) (category (string-ascii 50)) (findings (string-ascii 500)) (risk (string-ascii 20)))
  (let ((dd-id (+ (var-get dd-nonce) u1)))
    (map-set due-diligence
      { dd-id: dd-id }
      {
        application-id: application,
        reviewer: tx-sender,
        category: category,
        findings: findings,
        risk-level: risk,
        completed-at: stacks-block-height
      }
    )
    (var-set dd-nonce dd-id)
    (ok dd-id)
  )
)

(define-read-only (get-due-diligence (dd-id uint))
  (map-get? due-diligence { dd-id: dd-id })
)
