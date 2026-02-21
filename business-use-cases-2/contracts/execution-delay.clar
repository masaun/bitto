(define-map execution-delays 
  uint 
  {
    execution-id: uint,
    delay-until: uint,
    reason: (string-ascii 128),
    set-by: principal
  }
)

(define-read-only (get-delay (execution-id uint))
  (map-get? execution-delays execution-id)
)

(define-public (set-delay (execution-id uint) (delay-until uint) (reason (string-ascii 128)))
  (begin
    (map-set execution-delays execution-id {
      execution-id: execution-id,
      delay-until: delay-until,
      reason: reason,
      set-by: tx-sender
    })
    (ok true)
  )
)

(define-read-only (can-execute (execution-id uint))
  (match (map-get? execution-delays execution-id)
    delay (ok (>= stacks-block-height (get delay-until delay)))
    (ok true)
  )
)
