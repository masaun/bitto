(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map incidents
  { incident-id: uint }
  {
    incident-type: (string-ascii 50),
    details: (buff 512),
    severity: uint,
    timestamp: uint,
    reporter: principal
  }
)

(define-data-var incident-counter uint u0)

(define-read-only (get-incident (incident-id uint))
  (map-get? incidents { incident-id: incident-id })
)

(define-read-only (get-count)
  (ok (var-get incident-counter))
)

(define-public (log-incident (incident-type (string-ascii 50)) (details (buff 512)) (severity uint))
  (let ((incident-id (var-get incident-counter)))
    (map-set incidents
      { incident-id: incident-id }
      {
        incident-type: incident-type,
        details: details,
        severity: severity,
        timestamp: stacks-block-height,
        reporter: tx-sender
      }
    )
    (var-set incident-counter (+ incident-id u1))
    (ok incident-id)
  )
)

(define-public (update-severity (incident-id uint) (new-severity uint))
  (let ((inc-data (unwrap! (map-get? incidents { incident-id: incident-id }) err-not-found)))
    (asserts! (is-eq (get reporter inc-data) tx-sender) err-owner-only)
    (map-set incidents
      { incident-id: incident-id }
      (merge inc-data { severity: new-severity })
    )
    (ok true)
  )
)
