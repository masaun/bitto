(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map incidents
  { incident-id: uint }
  {
    severity: uint,
    status: (string-ascii 20),
    reported-at: uint,
    resolved-at: uint
  }
)

(define-data-var incident-nonce uint u0)

(define-public (report-incident (severity uint))
  (let ((incident-id (+ (var-get incident-nonce) u1)))
    (map-set incidents { incident-id: incident-id }
      {
        severity: severity,
        status: "open",
        reported-at: stacks-block-height,
        resolved-at: u0
      }
    )
    (var-set incident-nonce incident-id)
    (ok incident-id)
  )
)

(define-public (resolve-incident (incident-id uint))
  (let ((incident (unwrap! (map-get? incidents { incident-id: incident-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set incidents { incident-id: incident-id }
      (merge incident { status: "resolved", resolved-at: stacks-block-height })
    )
    (ok true)
  )
)

(define-read-only (get-incident (incident-id uint))
  (ok (map-get? incidents { incident-id: incident-id }))
)

(define-read-only (get-incident-count)
  (ok (var-get incident-nonce))
)
