(define-map security-reviews uint {
  entity: principal,
  review-type: (string-ascii 50),
  reviewer: principal,
  review-date: uint,
  clearance: bool,
  findings: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var review-counter uint u0)
(define-data-var security-authority principal tx-sender)

(define-read-only (get-security-review (review-id uint))
  (map-get? security-reviews review-id))

(define-public (conduct-security-review (entity principal) (review-type (string-ascii 50)) (clearance bool) (findings (string-utf8 512)))
  (let ((new-id (+ (var-get review-counter) u1)))
    (asserts! (is-eq tx-sender (var-get security-authority)) (err u1))
    (map-set security-reviews new-id {
      entity: entity,
      review-type: review-type,
      reviewer: tx-sender,
      review-date: stacks-block-height,
      clearance: clearance,
      findings: findings,
      status: "completed"
    })
    (var-set review-counter new-id)
    (ok new-id)))
