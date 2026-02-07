(define-map incentives uint {
  participant: principal,
  incentive-type: (string-ascii 50),
  amount: uint,
  recycling-quantity: uint,
  issue-date: uint,
  status: (string-ascii 20)
})

(define-data-var incentive-counter uint u0)
(define-data-var incentive-authority principal tx-sender)

(define-read-only (get-incentive (incentive-id uint))
  (map-get? incentives incentive-id))

(define-public (issue-incentive (participant principal) (incentive-type (string-ascii 50)) (amount uint) (recycling-quantity uint))
  (let ((new-id (+ (var-get incentive-counter) u1)))
    (asserts! (is-eq tx-sender (var-get incentive-authority)) (err u1))
    (map-set incentives new-id {
      participant: participant,
      incentive-type: incentive-type,
      amount: amount,
      recycling-quantity: recycling-quantity,
      issue-date: stacks-block-height,
      status: "issued"
    })
    (var-set incentive-counter new-id)
    (ok new-id)))
