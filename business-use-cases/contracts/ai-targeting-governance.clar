(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map targeting-decisions
  { decision-id: uint }
  {
    target-id: uint,
    approved: bool,
    reviewed-by: principal,
    reviewed-at: uint
  }
)

(define-data-var decision-nonce uint u0)

(define-public (review-targeting (target-id uint) (approved bool))
  (let ((decision-id (+ (var-get decision-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set targeting-decisions { decision-id: decision-id }
      {
        target-id: target-id,
        approved: approved,
        reviewed-by: tx-sender,
        reviewed-at: stacks-block-height
      }
    )
    (var-set decision-nonce decision-id)
    (ok decision-id)
  )
)

(define-read-only (get-decision (decision-id uint))
  (ok (map-get? targeting-decisions { decision-id: decision-id }))
)

(define-read-only (get-decision-count)
  (ok (var-get decision-nonce))
)
