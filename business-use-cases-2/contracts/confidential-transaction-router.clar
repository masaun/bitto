(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map routes
  { route-id: uint }
  {
    source: principal,
    destination: principal,
    encrypted-path: (buff 512),
    active: bool
  }
)

(define-data-var route-counter uint u0)

(define-read-only (get-route (route-id uint))
  (map-get? routes { route-id: route-id })
)

(define-read-only (get-route-count)
  (ok (var-get route-counter))
)

(define-public (create-route (destination principal) (encrypted-path (buff 512)))
  (let ((route-id (var-get route-counter)))
    (map-set routes
      { route-id: route-id }
      {
        source: tx-sender,
        destination: destination,
        encrypted-path: encrypted-path,
        active: true
      }
    )
    (var-set route-counter (+ route-id u1))
    (ok route-id)
  )
)

(define-public (deactivate-route (route-id uint))
  (let ((route-data (unwrap! (map-get? routes { route-id: route-id }) err-not-found)))
    (asserts! (is-eq (get source route-data) tx-sender) err-owner-only)
    (map-set routes
      { route-id: route-id }
      (merge route-data { active: false })
    )
    (ok true)
  )
)
