(define-map bid-commitments 
  uint 
  {
    bidder: principal,
    commitment-hash: (buff 32),
    revealed: bool,
    created-at: uint
  }
)

(define-data-var commitment-nonce uint u0)

(define-read-only (get-commitment (id uint))
  (map-get? bid-commitments id)
)

(define-public (commit-bid (commitment-hash (buff 32)))
  (let ((id (+ (var-get commitment-nonce) u1)))
    (map-set bid-commitments id {
      bidder: tx-sender,
      commitment-hash: commitment-hash,
      revealed: false,
      created-at: stacks-block-height
    })
    (var-set commitment-nonce id)
    (ok id)
  )
)

(define-read-only (verify-commitment (id uint) (value (buff 32)))
  (match (map-get? bid-commitments id)
    commitment (ok (is-eq (get commitment-hash commitment) value))
    (ok false)
  )
)
