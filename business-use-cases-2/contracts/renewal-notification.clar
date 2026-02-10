(define-map notifications 
  uint 
  {
    subscription-id: uint,
    message: (string-ascii 256),
    sent-at: uint,
    recipient: principal
  }
)

(define-data-var notif-nonce uint u0)

(define-read-only (get-notification (id uint))
  (map-get? notifications id)
)

(define-public (send-renewal-notification (subscription-id uint) (recipient principal) (message (string-ascii 256)))
  (let ((id (+ (var-get notif-nonce) u1)))
    (map-set notifications id {
      subscription-id: subscription-id,
      message: message,
      sent-at: stacks-block-height,
      recipient: recipient
    })
    (var-set notif-nonce id)
    (ok id)
  )
)
