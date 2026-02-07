(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map oversight-reviews
  { review-id: uint }
  {
    reviewed-entity: uint,
    reviewer: principal,
    findings: (string-ascii 200),
    reviewed-at: uint
  }
)

(define-data-var review-nonce uint u0)

(define-public (conduct-review (reviewed-entity uint) (findings (string-ascii 200)))
  (let ((review-id (+ (var-get review-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set oversight-reviews { review-id: review-id }
      {
        reviewed-entity: reviewed-entity,
        reviewer: tx-sender,
        findings: findings,
        reviewed-at: stacks-block-height
      }
    )
    (var-set review-nonce review-id)
    (ok review-id)
  )
)

(define-read-only (get-review (review-id uint))
  (ok (map-get? oversight-reviews { review-id: review-id }))
)

(define-read-only (get-review-count)
  (ok (var-get review-nonce))
)
