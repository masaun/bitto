(define-map escrow-registry-map 
  uint 
  {
    parties: (list 5 principal),
    amount: uint,
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var escrow-reg-nonce uint u0)

(define-read-only (get-escrow-registry (id uint))
  (map-get? escrow-registry-map id)
)

(define-public (register-escrow (parties (list 5 principal)) (amount uint))
  (let ((id (+ (var-get escrow-reg-nonce) u1)))
    (map-set escrow-registry-map id {
      parties: parties,
      amount: amount,
      status: "active",
      created-at: stacks-block-height
    })
    (var-set escrow-reg-nonce id)
    (ok id)
  )
)
