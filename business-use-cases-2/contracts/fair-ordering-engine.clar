(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map ordering-policies
  { policy-id: uint }
  {
    algorithm: (string-ascii 50),
    parameters: (buff 256),
    active: bool,
    creator: principal
  }
)

(define-data-var policy-counter uint u0)

(define-read-only (get-policy (policy-id uint))
  (map-get? ordering-policies { policy-id: policy-id })
)

(define-read-only (get-count)
  (ok (var-get policy-counter))
)

(define-public (create-policy (algorithm (string-ascii 50)) (parameters (buff 256)))
  (let ((policy-id (var-get policy-counter)))
    (map-set ordering-policies
      { policy-id: policy-id }
      {
        algorithm: algorithm,
        parameters: parameters,
        active: true,
        creator: tx-sender
      }
    )
    (var-set policy-counter (+ policy-id u1))
    (ok policy-id)
  )
)

(define-public (deactivate-policy (policy-id uint))
  (let ((policy-data (unwrap! (map-get? ordering-policies { policy-id: policy-id }) err-not-found)))
    (asserts! (is-eq (get creator policy-data) tx-sender) err-owner-only)
    (map-set ordering-policies
      { policy-id: policy-id }
      (merge policy-data { active: false })
    )
    (ok true)
  )
)
