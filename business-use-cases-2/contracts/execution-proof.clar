(define-map execution-proofs 
  uint 
  {
    execution-id: uint,
    proof-hash: (buff 32),
    verified: bool,
    created-at: uint
  }
)

(define-data-var proof-nonce uint u0)

(define-read-only (get-proof (id uint))
  (map-get? execution-proofs id)
)

(define-public (create-proof (execution-id uint) (proof-hash (buff 32)))
  (let ((id (+ (var-get proof-nonce) u1)))
    (map-set execution-proofs id {
      execution-id: execution-id,
      proof-hash: proof-hash,
      verified: false,
      created-at: stacks-block-height
    })
    (var-set proof-nonce id)
    (ok id)
  )
)

(define-public (verify-proof (id uint))
  (let ((proof (unwrap! (map-get? execution-proofs id) (err u1))))
    (map-set execution-proofs id (merge proof {verified: true}))
    (ok true)
  )
)
