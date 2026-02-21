(define-map acceptances 
  uint 
  {
    quote-id: uint,
    acceptor: principal,
    accepted-at: uint,
    signature: (string-ascii 256)
  }
)

(define-data-var acceptance-nonce uint u0)

(define-read-only (get-acceptance (id uint))
  (map-get? acceptances id)
)

(define-public (accept-quote (quote-id uint) (signature (string-ascii 256)))
  (let ((id (+ (var-get acceptance-nonce) u1)))
    (map-set acceptances id {
      quote-id: quote-id,
      acceptor: tx-sender,
      accepted-at: stacks-block-height,
      signature: signature
    })
    (var-set acceptance-nonce id)
    (ok id)
  )
)

(define-read-only (is-accepted (quote-id uint))
  (ok true)
)
