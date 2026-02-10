(define-map procurement-audits 
  uint 
  {
    procurement-id: uint,
    auditor: principal,
    findings: (string-ascii 512),
    severity: uint,
    audited-at: uint
  }
)

(define-data-var procurement-audit-nonce uint u0)

(define-read-only (get-procurement-audit (id uint))
  (map-get? procurement-audits id)
)

(define-public (log-procurement-audit (procurement-id uint) (findings (string-ascii 512)) (severity uint))
  (let ((id (+ (var-get procurement-audit-nonce) u1)))
    (map-set procurement-audits id {
      procurement-id: procurement-id,
      auditor: tx-sender,
      findings: findings,
      severity: severity,
      audited-at: stacks-block-height
    })
    (var-set procurement-audit-nonce id)
    (ok id)
  )
)
