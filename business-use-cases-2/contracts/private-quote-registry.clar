(define-map quotes 
  uint 
  {
    supplier: principal,
    buyer: principal,
    amount: uint,
    valid-until: uint,
    status: (string-ascii 20)
  }
)

(define-data-var quote-nonce uint u0)

(define-read-only (get-quote (id uint))
  (map-get? quotes id)
)

(define-public (create-quote (buyer principal) (amount uint) (valid-until uint))
  (let ((id (+ (var-get quote-nonce) u1)))
    (map-set quotes id {
      supplier: tx-sender,
      buyer: buyer,
      amount: amount,
      valid-until: valid-until,
      status: "active"
    })
    (var-set quote-nonce id)
    (ok id)
  )
)

(define-public (update-quote-status (id uint) (status (string-ascii 20)))
  (let ((quote (unwrap! (map-get? quotes id) (err u1))))
    (asserts! (is-eq tx-sender (get supplier quote)) (err u2))
    (map-set quotes id (merge quote {status: status}))
    (ok true)
  )
)
