(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map insurance-policies
  { policy-id: uint }
  {
    insured-asset: uint,
    coverage-amount: uint,
    active: bool,
    issued-at: uint
  }
)

(define-data-var policy-nonce uint u0)

(define-public (issue-policy (insured-asset uint) (coverage-amount uint))
  (let ((policy-id (+ (var-get policy-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set insurance-policies { policy-id: policy-id }
      {
        insured-asset: insured-asset,
        coverage-amount: coverage-amount,
        active: true,
        issued-at: stacks-block-height
      }
    )
    (var-set policy-nonce policy-id)
    (ok policy-id)
  )
)

(define-public (update-policy-status (policy-id uint) (active bool))
  (let ((policy (unwrap! (map-get? insurance-policies { policy-id: policy-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set insurance-policies { policy-id: policy-id } (merge policy { active: active }))
    (ok true)
  )
)

(define-read-only (get-policy (policy-id uint))
  (ok (map-get? insurance-policies { policy-id: policy-id }))
)

(define-read-only (get-policy-count)
  (ok (var-get policy-nonce))
)
