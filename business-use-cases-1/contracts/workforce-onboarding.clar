(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map workforce
  { worker-id: uint }
  {
    worker: principal,
    role: (string-ascii 50),
    onboarded: bool,
    onboarded-at: uint
  }
)

(define-data-var worker-nonce uint u0)

(define-public (onboard-worker (worker principal) (role (string-ascii 50)))
  (let ((worker-id (+ (var-get worker-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set workforce { worker-id: worker-id }
      {
        worker: worker,
        role: role,
        onboarded: true,
        onboarded-at: stacks-block-height
      }
    )
    (var-set worker-nonce worker-id)
    (ok worker-id)
  )
)

(define-read-only (get-worker (worker-id uint))
  (ok (map-get? workforce { worker-id: worker-id }))
)

(define-read-only (get-worker-count)
  (ok (var-get worker-nonce))
)
