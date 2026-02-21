(define-map bid-awards 
  uint 
  {
    auction-id: uint,
    winning-bid: uint,
    winner: principal,
    amount: uint,
    awarded-at: uint
  }
)

(define-data-var award-nonce uint u0)

(define-read-only (get-award (id uint))
  (map-get? bid-awards id)
)

(define-public (award-bid (auction-id uint) (winning-bid uint) (winner principal) (amount uint))
  (let ((id (+ (var-get award-nonce) u1)))
    (map-set bid-awards id {
      auction-id: auction-id,
      winning-bid: winning-bid,
      winner: winner,
      amount: amount,
      awarded-at: stacks-block-height
    })
    (var-set award-nonce id)
    (ok id)
  )
)
