(define-map payment-states 
  uint 
  {
    current-state: (string-ascii 32),
    previous-state: (string-ascii 32),
    updated-at: uint
  }
)

(define-read-only (get-state (payment-id uint))
  (map-get? payment-states payment-id)
)

(define-public (initialize-state (payment-id uint))
  (begin
    (map-set payment-states payment-id {
      current-state: "initialized",
      previous-state: "none",
      updated-at: stacks-block-height
    })
    (ok true)
  )
)

(define-public (transition-state (payment-id uint) (new-state (string-ascii 32)))
  (let ((state (unwrap! (map-get? payment-states payment-id) (err u1))))
    (map-set payment-states payment-id {
      current-state: new-state,
      previous-state: (get current-state state),
      updated-at: stacks-block-height
    })
    (ok true)
  )
)
