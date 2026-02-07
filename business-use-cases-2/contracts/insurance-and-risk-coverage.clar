(define-map insurance-policies uint {
  policyholder: principal,
  coverage-type: (string-ascii 50),
  coverage-amount: uint,
  premium: uint,
  start-date: uint,
  end-date: uint,
  status: (string-ascii 20)
})

(define-data-var policy-counter uint u0)

(define-read-only (get-insurance-policy (policy-id uint))
  (map-get? insurance-policies policy-id))

(define-public (create-policy (coverage-type (string-ascii 50)) (coverage-amount uint) (premium uint) (duration uint))
  (let ((new-id (+ (var-get policy-counter) u1)))
    (map-set insurance-policies new-id {
      policyholder: tx-sender,
      coverage-type: coverage-type,
      coverage-amount: coverage-amount,
      premium: premium,
      start-date: stacks-block-height,
      end-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set policy-counter new-id)
    (ok new-id)))
