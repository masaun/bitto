(define-map mentors
  { mentor-id: uint }
  {
    wallet: principal,
    name: (string-ascii 100),
    expertise: (string-ascii 200),
    availability: bool,
    rating: uint,
    registered-at: uint
  }
)

(define-data-var mentor-nonce uint u0)

(define-public (register-mentor (name (string-ascii 100)) (expertise (string-ascii 200)))
  (let ((mentor-id (+ (var-get mentor-nonce) u1)))
    (map-set mentors
      { mentor-id: mentor-id }
      {
        wallet: tx-sender,
        name: name,
        expertise: expertise,
        availability: true,
        rating: u0,
        registered-at: stacks-block-height
      }
    )
    (var-set mentor-nonce mentor-id)
    (ok mentor-id)
  )
)

(define-public (update-rating (mentor-id uint) (rating uint))
  (match (map-get? mentors { mentor-id: mentor-id })
    mentor (ok (map-set mentors { mentor-id: mentor-id } (merge mentor { rating: rating })))
    (err u404)
  )
)

(define-read-only (get-mentor (mentor-id uint))
  (map-get? mentors { mentor-id: mentor-id })
)
