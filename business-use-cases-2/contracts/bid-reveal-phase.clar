(define-map bid-reveals 
  uint 
  {
    bid-id: uint,
    bidder: principal,
    actual-amount: uint,
    nonce: (buff 32),
    revealed-at: uint
  }
)

(define-data-var reveal-nonce uint u0)

(define-read-only (get-reveal (id uint))
  (map-get? bid-reveals id)
)

(define-public (reveal-bid (bid-id uint) (actual-amount uint) (nonce (buff 32)))
  (let ((id (+ (var-get reveal-nonce) u1)))
    (map-set bid-reveals id {
      bid-id: bid-id,
      bidder: tx-sender,
      actual-amount: actual-amount,
      nonce: nonce,
      revealed-at: stacks-block-height
    })
    (var-set reveal-nonce id)
    (ok id)
  )
)
