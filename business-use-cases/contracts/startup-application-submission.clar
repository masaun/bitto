(define-map applications
  { application-id: uint }
  {
    window-id: uint,
    startup-name: (string-ascii 100),
    applicant: principal,
    submission-hash: (buff 32),
    submitted-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var application-nonce uint u0)

(define-public (submit-application (window uint) (name (string-ascii 100)) (hash (buff 32)))
  (let ((application-id (+ (var-get application-nonce) u1)))
    (map-set applications
      { application-id: application-id }
      {
        window-id: window,
        startup-name: name,
        applicant: tx-sender,
        submission-hash: hash,
        submitted-at: stacks-block-height,
        status: "pending"
      }
    )
    (var-set application-nonce application-id)
    (ok application-id)
  )
)

(define-public (update-application-status (application-id uint) (status (string-ascii 20)))
  (match (map-get? applications { application-id: application-id })
    application (ok (map-set applications { application-id: application-id } (merge application { status: status })))
    (err u404)
  )
)

(define-read-only (get-application (application-id uint))
  (map-get? applications { application-id: application-id })
)
