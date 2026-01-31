(define-map matchings
  { matching-id: uint }
  {
    mentor-id: uint,
    startup-id: uint,
    matched-at: uint,
    match-reason: (string-ascii 200),
    status: (string-ascii 20)
  }
)

(define-data-var matching-nonce uint u0)

(define-public (create-match (mentor uint) (startup uint) (reason (string-ascii 200)))
  (let ((matching-id (+ (var-get matching-nonce) u1)))
    (map-set matchings
      { matching-id: matching-id }
      {
        mentor-id: mentor,
        startup-id: startup,
        matched-at: stacks-block-height,
        match-reason: reason,
        status: "active"
      }
    )
    (var-set matching-nonce matching-id)
    (ok matching-id)
  )
)

(define-public (end-match (matching-id uint))
  (match (map-get? matchings { matching-id: matching-id })
    matching (ok (map-set matchings { matching-id: matching-id } (merge matching { status: "ended" })))
    (err u404)
  )
)

(define-read-only (get-matching (matching-id uint))
  (map-get? matchings { matching-id: matching-id })
)
