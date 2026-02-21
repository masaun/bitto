(define-map quote-drafts 
  uint 
  {
    creator: principal,
    description: (string-ascii 256),
    amount: uint,
    created-at: uint
  }
)

(define-data-var draft-nonce uint u0)

(define-read-only (get-draft (id uint))
  (map-get? quote-drafts id)
)

(define-public (create-draft (description (string-ascii 256)) (amount uint))
  (let ((id (+ (var-get draft-nonce) u1)))
    (map-set quote-drafts id {
      creator: tx-sender,
      description: description,
      amount: amount,
      created-at: stacks-block-height
    })
    (var-set draft-nonce id)
    (ok id)
  )
)

(define-public (delete-draft (id uint))
  (let ((draft (unwrap! (map-get? quote-drafts id) (err u1))))
    (asserts! (is-eq tx-sender (get creator draft)) (err u2))
    (map-delete quote-drafts id)
    (ok true)
  )
)
