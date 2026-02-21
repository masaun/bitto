(define-map procurements 
  uint 
  {
    requester: principal,
    description: (string-ascii 256),
    budget: uint,
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var procurement-nonce uint u0)

(define-read-only (get-procurement (id uint))
  (map-get? procurements id)
)

(define-public (register-procurement (description (string-ascii 256)) (budget uint))
  (let ((id (+ (var-get procurement-nonce) u1)))
    (map-set procurements id {
      requester: tx-sender,
      description: description,
      budget: budget,
      status: "open",
      created-at: stacks-block-height
    })
    (var-set procurement-nonce id)
    (ok id)
  )
)

(define-public (update-procurement-status (id uint) (status (string-ascii 20)))
  (let ((procurement (unwrap! (map-get? procurements id) (err u1))))
    (asserts! (is-eq tx-sender (get requester procurement)) (err u2))
    (map-set procurements id (merge procurement {status: status}))
    (ok true)
  )
)
