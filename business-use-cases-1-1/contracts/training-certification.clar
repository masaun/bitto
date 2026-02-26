(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map certifications
  { personnel: principal, cert-id: uint }
  {
    cert-name: (string-ascii 100),
    issued-at: uint,
    expires-at: uint,
    valid: bool
  }
)

(define-public (issue-certification (personnel principal) (cert-id uint) (cert-name (string-ascii 100)) (validity-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set certifications { personnel: personnel, cert-id: cert-id }
      {
        cert-name: cert-name,
        issued-at: stacks-block-height,
        expires-at: (+ stacks-block-height validity-period),
        valid: true
      }
    )
    (ok true)
  )
)

(define-public (revoke-certification (personnel principal) (cert-id uint))
  (let ((cert (unwrap! (map-get? certifications { personnel: personnel, cert-id: cert-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set certifications { personnel: personnel, cert-id: cert-id } (merge cert { valid: false }))
    (ok true)
  )
)

(define-read-only (get-certification (personnel principal) (cert-id uint))
  (ok (map-get? certifications { personnel: personnel, cert-id: cert-id }))
)
