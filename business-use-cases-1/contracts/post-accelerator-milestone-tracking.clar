(define-map post-milestones
  { post-milestone-id: uint }
  {
    startup-id: uint,
    milestone-type: (string-ascii 100),
    target-date: uint,
    achieved-date: (optional uint),
    status: (string-ascii 20),
    description: (string-ascii 200)
  }
)

(define-data-var post-milestone-nonce uint u0)

(define-public (set-post-milestone (startup uint) (milestone-type (string-ascii 100)) (target uint) (description (string-ascii 200)))
  (let ((post-milestone-id (+ (var-get post-milestone-nonce) u1)))
    (map-set post-milestones
      { post-milestone-id: post-milestone-id }
      {
        startup-id: startup,
        milestone-type: milestone-type,
        target-date: target,
        achieved-date: none,
        status: "pending",
        description: description
      }
    )
    (var-set post-milestone-nonce post-milestone-id)
    (ok post-milestone-id)
  )
)

(define-public (achieve-post-milestone (post-milestone-id uint))
  (match (map-get? post-milestones { post-milestone-id: post-milestone-id })
    milestone (ok (map-set post-milestones { post-milestone-id: post-milestone-id } (merge milestone { achieved-date: (some stacks-block-height), status: "achieved" })))
    (err u404)
  )
)

(define-read-only (get-post-milestone (post-milestone-id uint))
  (map-get? post-milestones { post-milestone-id: post-milestone-id })
)
