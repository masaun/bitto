(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map ai-compliance
  { system-id: uint }
  {
    compliant: bool,
    last-audit: uint,
    auditor: principal
  }
)

(define-public (audit-system (system-id uint) (compliant bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set ai-compliance { system-id: system-id }
      {
        compliant: compliant,
        last-audit: stacks-block-height,
        auditor: tx-sender
      }
    )
    (ok true)
  )
)

(define-read-only (get-compliance (system-id uint))
  (ok (map-get? ai-compliance { system-id: system-id }))
)
