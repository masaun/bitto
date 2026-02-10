(define-map bids 
  uint 
  {
    bidder: principal,
    item-id: uint,
    amount: uint,
    status: (string-ascii 20),
    submitted-at: uint
  }
)

(define-data-var bid-nonce uint u0)

(define-read-only (get-bid (id uint))
  (map-get? bids id)
)

(define-public (submit-bid (item-id uint) (amount uint))
  (let ((id (+ (var-get bid-nonce) u1)))
    (map-set bids id {
      bidder: tx-sender,
      item-id: item-id,
      amount: amount,
      status: "submitted",
      submitted-at: stacks-block-height
    })
    (var-set bid-nonce id)
    (ok id)
  )
)

(define-public (update-bid-status (id uint) (status (string-ascii 20)))
  (let ((bid (unwrap! (map-get? bids id) (err u1))))
    (map-set bids id (merge bid {status: status}))
    (ok true)
  )
)
