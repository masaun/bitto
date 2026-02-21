(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map sequencing-policies
  { policy-id: uint }
  {
    name: (string-ascii 50),
    rules: (buff 512),
    enabled: bool,
    creator: principal
  }
)

(define-data-var policy-counter uint u0)

(define-read-only (get-policy (policy-id uint))
  (map-get? sequencing-policies { policy-id: policy-id })
)

(define-read-only (get-count)
  (ok (var-get policy-counter))
)

(define-public (create-policy (name (string-ascii 50)) (rules (buff 512)))
  (let ((policy-id (var-get policy-counter)))
    (map-set sequencing-policies
      { policy-id: policy-id }
      {
        name: name,
        rules: rules,
        enabled: true,
        creator: tx-sender
      }
    )
    (var-set policy-counter (+ policy-id u1))
    (ok policy-id)
  )
)

(define-public (toggle-policy (policy-id uint) (enabled bool))
  (let ((policy-data (unwrap! (map-get? sequencing-policies { policy-id: policy-id }) err-not-found)))
    (asserts! (is-eq (get creator policy-data) tx-sender) err-owner-only)
    (map-set sequencing-policies
      { policy-id: policy-id }
      (merge policy-data { enabled: enabled })
    )
    (ok true)
  )
)
