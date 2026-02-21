(define-map payment-registrations 
  uint 
  {
    payer: principal,
    payee: principal,
    amount: uint,
    conditions: (string-ascii 256),
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var registry-nonce uint u0)

(define-read-only (get-payment (id uint))
  (map-get? payment-registrations id)
)

(define-public (register-payment (payee principal) (amount uint) (conditions (string-ascii 256)))
  (let ((id (+ (var-get registry-nonce) u1)))
    (map-set payment-registrations id {
      payer: tx-sender,
      payee: payee,
      amount: amount,
      conditions: conditions,
      status: "pending",
      created-at: stacks-block-height
    })
    (var-set registry-nonce id)
    (ok id)
  )
)

(define-public (update-status (id uint) (new-status (string-ascii 20)))
  (let ((payment (unwrap! (map-get? payment-registrations id) (err u1))))
    (asserts! (is-eq tx-sender (get payer payment)) (err u2))
    (map-set payment-registrations id (merge payment {status: new-status}))
    (ok true)
  )
)
