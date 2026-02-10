(define-map procurement-awards 
  uint 
  {
    procurement-id: uint,
    winner: principal,
    amount: uint,
    awarded-by: principal,
    awarded-at: uint
  }
)

(define-data-var procurement-award-nonce uint u0)

(define-read-only (get-procurement-award (id uint))
  (map-get? procurement-awards id)
)

(define-public (award-procurement (procurement-id uint) (winner principal) (amount uint))
  (let ((id (+ (var-get procurement-award-nonce) u1)))
    (map-set procurement-awards id {
      procurement-id: procurement-id,
      winner: winner,
      amount: amount,
      awarded-by: tx-sender,
      awarded-at: stacks-block-height
    })
    (var-set procurement-award-nonce id)
    (ok id)
  )
)
