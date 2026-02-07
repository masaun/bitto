(define-map royalty-payments uint {
  payer: principal,
  payee: principal,
  project-id: uint,
  amount: uint,
  payment-date: uint,
  period: uint
})

(define-data-var payment-counter uint u0)

(define-read-only (get-royalty-payment (payment-id uint))
  (map-get? royalty-payments payment-id))

(define-public (distribute-royalty (payee principal) (project-id uint) (amount uint) (period uint))
  (let ((new-id (+ (var-get payment-counter) u1)))
    (map-set royalty-payments new-id {
      payer: tx-sender,
      payee: payee,
      project-id: project-id,
      amount: amount,
      payment-date: stacks-block-height,
      period: period
    })
    (var-set payment-counter new-id)
    (ok new-id)))
