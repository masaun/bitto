(define-map escrow-timeouts 
  uint 
  {
    timeout-height: uint,
    refund-to: principal,
    timed-out: bool
  }
)

(define-read-only (get-escrow-timeout (escrow-id uint))
  (map-get? escrow-timeouts escrow-id)
)

(define-public (set-escrow-timeout (escrow-id uint) (timeout-height uint) (refund-to principal))
  (begin
    (map-set escrow-timeouts escrow-id {
      timeout-height: timeout-height,
      refund-to: refund-to,
      timed-out: false
    })
    (ok true)
  )
)

(define-public (trigger-timeout (escrow-id uint))
  (let ((timeout (unwrap! (map-get? escrow-timeouts escrow-id) (err u1))))
    (asserts! (>= stacks-block-height (get timeout-height timeout)) (err u2))
    (map-set escrow-timeouts escrow-id (merge timeout {timed-out: true}))
    (ok true)
  )
)
