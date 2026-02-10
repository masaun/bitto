(define-map archives 
  uint 
  {
    execution-id: uint,
    archived-by: principal,
    archived-at: uint,
    data-hash: (buff 32)
  }
)

(define-data-var archive-nonce uint u0)

(define-read-only (get-archive (id uint))
  (map-get? archives id)
)

(define-public (archive-execution (execution-id uint) (data-hash (buff 32)))
  (let ((id (+ (var-get archive-nonce) u1)))
    (map-set archives id {
      execution-id: execution-id,
      archived-by: tx-sender,
      archived-at: stacks-block-height,
      data-hash: data-hash
    })
    (var-set archive-nonce id)
    (ok id)
  )
)
