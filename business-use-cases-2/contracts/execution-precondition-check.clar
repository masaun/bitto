(define-map preconditions 
  uint 
  {
    execution-id: uint,
    condition-type: (string-ascii 64),
    met: bool,
    checked-at: uint
  }
)

(define-data-var precond-nonce uint u0)

(define-read-only (get-precondition (id uint))
  (map-get? preconditions id)
)

(define-public (check-precondition (execution-id uint) (condition-type (string-ascii 64)))
  (let ((id (+ (var-get precond-nonce) u1)))
    (map-set preconditions id {
      execution-id: execution-id,
      condition-type: condition-type,
      met: true,
      checked-at: stacks-block-height
    })
    (var-set precond-nonce id)
    (ok id)
  )
)
