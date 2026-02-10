(define-map bid-ranks 
  {auction-id: uint, rank: uint}
  {
    bid-id: uint,
    score: uint,
    updated-at: uint
  }
)

(define-read-only (get-rank (auction-id uint) (rank uint))
  (map-get? bid-ranks {auction-id: auction-id, rank: rank})
)

(define-public (set-rank (auction-id uint) (rank uint) (bid-id uint) (score uint))
  (begin
    (map-set bid-ranks {auction-id: auction-id, rank: rank} {
      bid-id: bid-id,
      score: score,
      updated-at: stacks-block-height
    })
    (ok true)
  )
)

(define-read-only (get-top-bid (auction-id uint))
  (map-get? bid-ranks {auction-id: auction-id, rank: u1})
)
