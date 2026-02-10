(define-map anonymous-bids 
  uint 
  {
    pseudo-id: (buff 32),
    bid-hash: (buff 32),
    item-id: uint,
    submitted-at: uint
  }
)

(define-data-var anon-nonce uint u0)

(define-read-only (get-anonymous-bid (id uint))
  (map-get? anonymous-bids id)
)

(define-public (submit-anonymous (pseudo-id (buff 32)) (bid-hash (buff 32)) (item-id uint))
  (let ((id (+ (var-get anon-nonce) u1)))
    (map-set anonymous-bids id {
      pseudo-id: pseudo-id,
      bid-hash: bid-hash,
      item-id: item-id,
      submitted-at: stacks-block-height
    })
    (var-set anon-nonce id)
    (ok id)
  )
)
