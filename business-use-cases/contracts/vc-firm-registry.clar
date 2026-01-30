(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map registry
  { id: uint }
  {
    data-hash: (buff 32),
    created-at: uint,
    creator: principal
  }
)

(define-data-var nonce uint u0)

(define-public (register-entry (data-hash (buff 32)))
  (let ((id (+ (var-get nonce) u1)))
    (map-set registry { id: id }
      {
        data-hash: data-hash,
        created-at: stacks-block-height,
        creator: tx-sender
      }
    )
    (var-set nonce id)
    (ok id)
  )
)

(define-read-only (get-entry (id uint))
  (ok (map-get? registry { id: id }))
)

(define-read-only (get-count)
  (ok (var-get nonce))
)
