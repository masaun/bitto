(define-map policy-priorities 
  uint 
  {
    priority-level: uint,
    override-allowed: bool,
    set-by: principal,
    set-at: uint
  }
)

(define-read-only (get-priority (policy-id uint))
  (map-get? policy-priorities policy-id)
)

(define-public (set-priority (policy-id uint) (priority uint) (override bool))
  (begin
    (map-set policy-priorities policy-id {
      priority-level: priority,
      override-allowed: override,
      set-by: tx-sender,
      set-at: stacks-block-height
    })
    (ok true)
  )
)
