(define-map pitch-order
  { order-id: uint }
  {
    demo-day-id: uint,
    startup-id: uint,
    sequence: uint,
    time-slot: uint,
    duration: uint
  }
)

(define-data-var order-nonce uint u0)

(define-public (set-pitch-order (demo-day uint) (startup uint) (sequence uint) (time-slot uint) (duration uint))
  (let ((order-id (+ (var-get order-nonce) u1)))
    (map-set pitch-order
      { order-id: order-id }
      {
        demo-day-id: demo-day,
        startup-id: startup,
        sequence: sequence,
        time-slot: time-slot,
        duration: duration
      }
    )
    (var-set order-nonce order-id)
    (ok order-id)
  )
)

(define-read-only (get-pitch-order (order-id uint))
  (map-get? pitch-order { order-id: order-id })
)
