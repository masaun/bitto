(define-map confidential-quotes 
  uint 
  {
    hash: (buff 32),
    authorized-viewers: (list 10 principal),
    created-at: uint
  }
)

(define-data-var confidential-nonce uint u0)

(define-read-only (get-confidential (id uint))
  (map-get? confidential-quotes id)
)

(define-public (create-confidential (hash (buff 32)) (viewers (list 10 principal)))
  (let ((id (+ (var-get confidential-nonce) u1)))
    (map-set confidential-quotes id {
      hash: hash,
      authorized-viewers: viewers,
      created-at: stacks-block-height
    })
    (var-set confidential-nonce id)
    (ok id)
  )
)

(define-read-only (is-authorized (quote-id uint) (viewer principal))
  (match (map-get? confidential-quotes quote-id)
    quote (ok (is-some (index-of (get authorized-viewers quote) viewer)))
    (ok false)
  )
)
