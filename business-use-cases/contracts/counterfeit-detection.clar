(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map counterfeits
  { component-id: uint }
  {
    verified: bool,
    verification-method: (string-ascii 100),
    verified-at: uint,
    flagged: bool
  }
)

(define-public (verify-component (component-id uint) (verification-method (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set counterfeits { component-id: component-id }
      {
        verified: true,
        verification-method: verification-method,
        verified-at: stacks-block-height,
        flagged: false
      }
    )
    (ok true)
  )
)

(define-public (flag-counterfeit (component-id uint))
  (let ((verification (unwrap! (map-get? counterfeits { component-id: component-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set counterfeits { component-id: component-id } (merge verification { flagged: true }))
    (ok true)
  )
)

(define-read-only (get-verification (component-id uint))
  (ok (map-get? counterfeits { component-id: component-id }))
)
