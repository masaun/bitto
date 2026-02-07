(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map design-approvals
  { design-id: uint }
  {
    project-id: uint,
    design-hash: (buff 32),
    approved: bool,
    submitted-at: uint
  }
)

(define-data-var design-nonce uint u0)

(define-public (submit-design (project-id uint) (design-hash (buff 32)))
  (let ((design-id (+ (var-get design-nonce) u1)))
    (map-set design-approvals { design-id: design-id }
      {
        project-id: project-id,
        design-hash: design-hash,
        approved: false,
        submitted-at: stacks-block-height
      }
    )
    (var-set design-nonce design-id)
    (ok design-id)
  )
)

(define-public (approve-design (design-id uint))
  (let ((design (unwrap! (map-get? design-approvals { design-id: design-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set design-approvals { design-id: design-id } (merge design { approved: true }))
    (ok true)
  )
)

(define-read-only (get-design-approval (design-id uint))
  (ok (map-get? design-approvals { design-id: design-id }))
)

(define-read-only (get-design-count)
  (ok (var-get design-nonce))
)
