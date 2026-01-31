(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map safety-certs
  { worker: principal, cert-type: (string-ascii 50) }
  {
    certified: bool,
    issued-at: uint,
    expires-at: uint
  }
)

(define-public (issue-safety-cert (worker principal) (cert-type (string-ascii 50)) (validity-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set safety-certs { worker: worker, cert-type: cert-type }
      {
        certified: true,
        issued-at: stacks-block-height,
        expires-at: (+ stacks-block-height validity-period)
      }
    )
    (ok true)
  )
)

(define-read-only (get-safety-cert (worker principal) (cert-type (string-ascii 50)))
  (ok (map-get? safety-certs { worker: worker, cert-type: cert-type }))
)
