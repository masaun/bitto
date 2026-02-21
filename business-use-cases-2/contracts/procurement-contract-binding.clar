(define-map contract-bindings 
  uint 
  {
    procurement-id: uint,
    contract-hash: (buff 32),
    parties: (list 5 principal),
    binding-date: uint,
    valid: bool
  }
)

(define-data-var binding-nonce uint u0)

(define-read-only (get-binding (id uint))
  (map-get? contract-bindings id)
)

(define-public (bind-contract (procurement-id uint) (contract-hash (buff 32)) (parties (list 5 principal)))
  (let ((id (+ (var-get binding-nonce) u1)))
    (map-set contract-bindings id {
      procurement-id: procurement-id,
      contract-hash: contract-hash,
      parties: parties,
      binding-date: stacks-block-height,
      valid: true
    })
    (var-set binding-nonce id)
    (ok id)
  )
)
