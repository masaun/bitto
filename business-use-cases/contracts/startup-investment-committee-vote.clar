(define-map votes
  { vote-id: uint }
  {
    application-id: uint,
    voter: principal,
    vote: bool,
    weight: uint,
    voted-at: uint,
    comments: (string-ascii 200)
  }
)

(define-data-var vote-nonce uint u0)

(define-public (cast-vote (application uint) (vote bool) (weight uint) (comments (string-ascii 200)))
  (let ((vote-id (+ (var-get vote-nonce) u1)))
    (map-set votes
      { vote-id: vote-id }
      {
        application-id: application,
        voter: tx-sender,
        vote: vote,
        weight: weight,
        voted-at: stacks-block-height,
        comments: comments
      }
    )
    (var-set vote-nonce vote-id)
    (ok vote-id)
  )
)

(define-read-only (get-vote (vote-id uint))
  (map-get? votes { vote-id: vote-id })
)
