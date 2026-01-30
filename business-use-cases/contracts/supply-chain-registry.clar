(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map participants
  { participant-id: uint }
  {
    name: (string-ascii 100),
    role: (string-ascii 50),
    verified: bool,
    registered-at: uint
  }
)

(define-data-var participant-nonce uint u0)

(define-public (register-participant (name (string-ascii 100)) (role (string-ascii 50)))
  (let ((participant-id (+ (var-get participant-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set participants { participant-id: participant-id }
      {
        name: name,
        role: role,
        verified: false,
        registered-at: stacks-block-height
      }
    )
    (var-set participant-nonce participant-id)
    (ok participant-id)
  )
)

(define-public (verify-participant (participant-id uint) (verified bool))
  (let ((participant (unwrap! (map-get? participants { participant-id: participant-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set participants { participant-id: participant-id } (merge participant { verified: verified }))
    (ok true)
  )
)

(define-read-only (get-participant (participant-id uint))
  (ok (map-get? participants { participant-id: participant-id }))
)

(define-read-only (get-participant-count)
  (ok (var-get participant-nonce))
)
