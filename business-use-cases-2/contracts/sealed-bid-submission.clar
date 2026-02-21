(define-map sealed-bids 
  uint 
  {
    bidder: principal,
    bid-hash: (buff 32),
    item-id: uint,
    revealed: bool,
    submitted-at: uint
  }
)

(define-data-var sealed-nonce uint u0)

(define-read-only (get-sealed-bid (id uint))
  (map-get? sealed-bids id)
)

(define-public (submit-sealed-bid (item-id uint) (bid-hash (buff 32)))
  (let ((id (+ (var-get sealed-nonce) u1)))
    (map-set sealed-bids id {
      bidder: tx-sender,
      bid-hash: bid-hash,
      item-id: item-id,
      revealed: false,
      submitted-at: stacks-block-height
    })
    (var-set sealed-nonce id)
    (ok id)
  )
)
