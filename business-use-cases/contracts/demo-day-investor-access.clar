(define-map investor-access
  { access-id: uint }
  {
    demo-day-id: uint,
    investor-id: uint,
    access-level: (string-ascii 20),
    granted-at: uint,
    expires-at: uint
  }
)

(define-data-var access-nonce uint u0)

(define-public (grant-investor-access (demo-day uint) (investor uint) (access-level (string-ascii 20)) (expires uint))
  (let ((access-id (+ (var-get access-nonce) u1)))
    (map-set investor-access
      { access-id: access-id }
      {
        demo-day-id: demo-day,
        investor-id: investor,
        access-level: access-level,
        granted-at: stacks-block-height,
        expires-at: expires
      }
    )
    (var-set access-nonce access-id)
    (ok access-id)
  )
)

(define-read-only (get-investor-access (access-id uint))
  (map-get? investor-access { access-id: access-id })
)
