(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map mobilization-plans
  { plan-id: uint }
  {
    plan-name: (string-ascii 100),
    alert-level: uint,
    activated: bool,
    created-at: uint
  }
)

(define-data-var plan-nonce uint u0)

(define-public (create-mobilization-plan (plan-name (string-ascii 100)) (alert-level uint))
  (let ((plan-id (+ (var-get plan-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set mobilization-plans { plan-id: plan-id }
      {
        plan-name: plan-name,
        alert-level: alert-level,
        activated: false,
        created-at: stacks-block-height
      }
    )
    (var-set plan-nonce plan-id)
    (ok plan-id)
  )
)

(define-public (activate-mobilization (plan-id uint))
  (let ((plan (unwrap! (map-get? mobilization-plans { plan-id: plan-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set mobilization-plans { plan-id: plan-id } (merge plan { activated: true }))
    (ok true)
  )
)

(define-read-only (get-mobilization-plan (plan-id uint))
  (ok (map-get? mobilization-plans { plan-id: plan-id }))
)

(define-read-only (get-plan-count)
  (ok (var-get plan-nonce))
)
