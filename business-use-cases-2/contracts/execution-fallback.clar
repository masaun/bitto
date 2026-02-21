(define-map fallbacks 
  uint 
  {
    execution-id: uint,
    fallback-action: (string-ascii 128),
    triggered: bool,
    trigger-at: uint
  }
)

(define-read-only (get-fallback (execution-id uint))
  (map-get? fallbacks execution-id)
)

(define-public (set-fallback (execution-id uint) (action (string-ascii 128)))
  (begin
    (map-set fallbacks execution-id {
      execution-id: execution-id,
      fallback-action: action,
      triggered: false,
      trigger-at: u0
    })
    (ok true)
  )
)

(define-public (trigger-fallback (execution-id uint))
  (let ((fallback (unwrap! (map-get? fallbacks execution-id) (err u1))))
    (map-set fallbacks execution-id (merge fallback {triggered: true, trigger-at: stacks-block-height}))
    (ok true)
  )
)
