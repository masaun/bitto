(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map permits
  { permit-id: uint }
  {
    project-id: uint,
    permit-type: (string-ascii 50),
    approved: bool,
    issued-at: uint
  }
)

(define-data-var permit-nonce uint u0)

(define-public (issue-permit (project-id uint) (permit-type (string-ascii 50)))
  (let ((permit-id (+ (var-get permit-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set permits { permit-id: permit-id }
      {
        project-id: project-id,
        permit-type: permit-type,
        approved: false,
        issued-at: stacks-block-height
      }
    )
    (var-set permit-nonce permit-id)
    (ok permit-id)
  )
)

(define-public (approve-permit (permit-id uint))
  (let ((permit (unwrap! (map-get? permits { permit-id: permit-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set permits { permit-id: permit-id } (merge permit { approved: true }))
    (ok true)
  )
)

(define-read-only (get-permit (permit-id uint))
  (ok (map-get? permits { permit-id: permit-id }))
)

(define-read-only (get-permit-count)
  (ok (var-get permit-nonce))
)
