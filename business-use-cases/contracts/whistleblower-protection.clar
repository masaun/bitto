(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map whistleblower-reports
  { report-id: uint }
  {
    reporter: principal,
    protected: bool,
    report-hash: (buff 32),
    filed-at: uint
  }
)

(define-data-var report-nonce uint u0)

(define-public (file-whistleblower-report (report-hash (buff 32)))
  (let ((report-id (+ (var-get report-nonce) u1)))
    (map-set whistleblower-reports { report-id: report-id }
      {
        reporter: tx-sender,
        protected: true,
        report-hash: report-hash,
        filed-at: stacks-block-height
      }
    )
    (var-set report-nonce report-id)
    (ok report-id)
  )
)

(define-read-only (get-whistleblower-report (report-id uint))
  (ok (map-get? whistleblower-reports { report-id: report-id }))
)

(define-read-only (get-report-count)
  (ok (var-get report-nonce))
)
