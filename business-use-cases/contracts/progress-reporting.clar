(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map progress-reports
  { report-id: uint }
  {
    project-id: uint,
    completion-percentage: uint,
    reported-by: principal,
    reported-at: uint
  }
)

(define-data-var report-nonce uint u0)

(define-public (submit-progress-report (project-id uint) (completion-percentage uint))
  (let ((report-id (+ (var-get report-nonce) u1)))
    (map-set progress-reports { report-id: report-id }
      {
        project-id: project-id,
        completion-percentage: completion-percentage,
        reported-by: tx-sender,
        reported-at: stacks-block-height
      }
    )
    (var-set report-nonce report-id)
    (ok report-id)
  )
)

(define-read-only (get-progress-report (report-id uint))
  (ok (map-get? progress-reports { report-id: report-id }))
)

(define-read-only (get-report-count)
  (ok (var-get report-nonce))
)
