(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map authorizations
  { command-id: uint }
  {
    authorized-by: principal,
    authorized-personnel: (list 10 principal),
    expires-at: uint,
    active: bool
  }
)

(define-data-var command-nonce uint u0)

(define-public (grant-authorization (authorized-personnel (list 10 principal)) (validity-period uint))
  (let ((command-id (+ (var-get command-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set authorizations { command-id: command-id }
      {
        authorized-by: tx-sender,
        authorized-personnel: authorized-personnel,
        expires-at: (+ stacks-block-height validity-period),
        active: true
      }
    )
    (var-set command-nonce command-id)
    (ok command-id)
  )
)

(define-public (revoke-authorization (command-id uint))
  (let ((auth (unwrap! (map-get? authorizations { command-id: command-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set authorizations { command-id: command-id } (merge auth { active: false }))
    (ok true)
  )
)

(define-read-only (get-authorization (command-id uint))
  (ok (map-get? authorizations { command-id: command-id }))
)

(define-read-only (get-command-count)
  (ok (var-get command-nonce))
)
