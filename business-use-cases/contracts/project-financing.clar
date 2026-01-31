(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map financing
  { loan-id: uint }
  {
    project-id: uint,
    amount: uint,
    lender: principal,
    disbursed: bool,
    issued-at: uint
  }
)

(define-data-var loan-nonce uint u0)

(define-public (create-financing (project-id uint) (amount uint) (lender principal))
  (let ((loan-id (+ (var-get loan-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set financing { loan-id: loan-id }
      {
        project-id: project-id,
        amount: amount,
        lender: lender,
        disbursed: false,
        issued-at: stacks-block-height
      }
    )
    (var-set loan-nonce loan-id)
    (ok loan-id)
  )
)

(define-public (disburse-loan (loan-id uint))
  (let ((loan (unwrap! (map-get? financing { loan-id: loan-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set financing { loan-id: loan-id } (merge loan { disbursed: true }))
    (ok true)
  )
)

(define-read-only (get-financing (loan-id uint))
  (ok (map-get? financing { loan-id: loan-id }))
)

(define-read-only (get-loan-count)
  (ok (var-get loan-nonce))
)
