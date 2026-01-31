(define-map milestones
  { milestone-id: uint }
  {
    startup-id: uint,
    milestone-name: (string-ascii 100),
    target-date: uint,
    achieved-at: (optional uint),
    status: (string-ascii 20)
  }
)

(define-data-var milestone-nonce uint u0)

(define-public (set-milestone (startup uint) (name (string-ascii 100)) (target uint))
  (let ((milestone-id (+ (var-get milestone-nonce) u1)))
    (map-set milestones
      { milestone-id: milestone-id }
      {
        startup-id: startup,
        milestone-name: name,
        target-date: target,
        achieved-at: none,
        status: "pending"
      }
    )
    (var-set milestone-nonce milestone-id)
    (ok milestone-id)
  )
)

(define-public (complete-milestone (milestone-id uint))
  (match (map-get? milestones { milestone-id: milestone-id })
    milestone (ok (map-set milestones { milestone-id: milestone-id } (merge milestone { achieved-at: (some stacks-block-height), status: "achieved" })))
    (err u404)
  )
)

(define-read-only (get-milestone (milestone-id uint))
  (map-get? milestones { milestone-id: milestone-id })
)
