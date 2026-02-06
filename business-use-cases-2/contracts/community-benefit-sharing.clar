(define-map benefit-distributions uint {
  community: (string-ascii 100),
  distribution-type: (string-ascii 50),
  amount: uint,
  distribution-date: uint,
  beneficiary-count: uint,
  status: (string-ascii 20)
})

(define-data-var distribution-counter uint u0)
(define-data-var distribution-authority principal tx-sender)

(define-read-only (get-benefit-distribution (distribution-id uint))
  (map-get? benefit-distributions distribution-id))

(define-public (distribute-benefits (community (string-ascii 100)) (distribution-type (string-ascii 50)) (amount uint) (beneficiary-count uint))
  (let ((new-id (+ (var-get distribution-counter) u1)))
    (asserts! (is-eq tx-sender (var-get distribution-authority)) (err u1))
    (map-set benefit-distributions new-id {
      community: community,
      distribution-type: distribution-type,
      amount: amount,
      distribution-date: stacks-block-height,
      beneficiary-count: beneficiary-count,
      status: "completed"
    })
    (var-set distribution-counter new-id)
    (ok new-id)))
