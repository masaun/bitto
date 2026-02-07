(define-map disbursements
  { disbursement-id: uint }
  {
    startup-id: uint,
    amount: uint,
    milestone: (string-ascii 100),
    disbursed-at: uint,
    recipient: principal,
    status: (string-ascii 20)
  }
)

(define-data-var disbursement-nonce uint u0)

(define-public (disburse-funds (startup uint) (amount uint) (milestone (string-ascii 100)) (recipient principal))
  (let ((disbursement-id (+ (var-get disbursement-nonce) u1)))
    (map-set disbursements
      { disbursement-id: disbursement-id }
      {
        startup-id: startup,
        amount: amount,
        milestone: milestone,
        disbursed-at: stacks-block-height,
        recipient: recipient,
        status: "completed"
      }
    )
    (var-set disbursement-nonce disbursement-id)
    (ok disbursement-id)
  )
)

(define-read-only (get-disbursement (disbursement-id uint))
  (map-get? disbursements { disbursement-id: disbursement-id })
)
