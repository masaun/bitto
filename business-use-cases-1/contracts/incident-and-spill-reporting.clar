(define-map incidents
  { incident-id: uint }
  {
    facility-id: uint,
    incident-type: (string-ascii 100),
    severity: (string-ascii 20),
    description: (string-ascii 500),
    occurred-at: uint,
    reported-by: principal,
    status: (string-ascii 20)
  }
)

(define-data-var incident-nonce uint u0)

(define-public (report-incident (facility uint) (incident-type (string-ascii 100)) (severity (string-ascii 20)) (description (string-ascii 500)))
  (let ((incident-id (+ (var-get incident-nonce) u1)))
    (map-set incidents
      { incident-id: incident-id }
      {
        facility-id: facility,
        incident-type: incident-type,
        severity: severity,
        description: description,
        occurred-at: stacks-block-height,
        reported-by: tx-sender,
        status: "open"
      }
    )
    (var-set incident-nonce incident-id)
    (ok incident-id)
  )
)

(define-public (close-incident (incident-id uint))
  (match (map-get? incidents { incident-id: incident-id })
    incident (ok (map-set incidents { incident-id: incident-id } (merge incident { status: "closed" })))
    (err u404)
  )
)

(define-read-only (get-incident (incident-id uint))
  (map-get? incidents { incident-id: incident-id })
)
