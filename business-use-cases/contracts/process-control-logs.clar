(define-map process-logs
  { log-id: uint }
  {
    batch-id: uint,
    process-step: (string-ascii 50),
    temperature: uint,
    pressure: uint,
    duration: uint,
    recorded-at: uint,
    operator: principal
  }
)

(define-data-var log-nonce uint u0)

(define-public (log-process (batch uint) (step (string-ascii 50)) (temp uint) (press uint) (dur uint))
  (let ((log-id (+ (var-get log-nonce) u1)))
    (map-set process-logs
      { log-id: log-id }
      {
        batch-id: batch,
        process-step: step,
        temperature: temp,
        pressure: press,
        duration: dur,
        recorded-at: stacks-block-height,
        operator: tx-sender
      }
    )
    (var-set log-nonce log-id)
    (ok log-id)
  )
)

(define-read-only (get-process-log (log-id uint))
  (map-get? process-logs { log-id: log-id })
)
