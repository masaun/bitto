(define-map confidential-docs 
  uint 
  {
    procurement-id: uint,
    doc-hash: (buff 32),
    authorized-viewers: (list 10 principal),
    uploaded-by: principal,
    uploaded-at: uint
  }
)

(define-data-var doc-nonce uint u0)

(define-read-only (get-confidential-doc (id uint))
  (map-get? confidential-docs id)
)

(define-public (upload-confidential (procurement-id uint) (doc-hash (buff 32)) (viewers (list 10 principal)))
  (let ((id (+ (var-get doc-nonce) u1)))
    (map-set confidential-docs id {
      procurement-id: procurement-id,
      doc-hash: doc-hash,
      authorized-viewers: viewers,
      uploaded-by: tx-sender,
      uploaded-at: stacks-block-height
    })
    (var-set doc-nonce id)
    (ok id)
  )
)
