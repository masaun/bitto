(define-map recalls
  { recall-id: uint }
  {
    product-id: uint,
    reason: (string-ascii 200),
    severity: (string-ascii 20),
    initiated-at: uint,
    initiated-by: principal,
    status: (string-ascii 20)
  }
)

(define-data-var recall-nonce uint u0)

(define-public (initiate-recall (product uint) (reason (string-ascii 200)) (severity (string-ascii 20)))
  (let ((recall-id (+ (var-get recall-nonce) u1)))
    (map-set recalls
      { recall-id: recall-id }
      {
        product-id: product,
        reason: reason,
        severity: severity,
        initiated-at: stacks-block-height,
        initiated-by: tx-sender,
        status: "active"
      }
    )
    (var-set recall-nonce recall-id)
    (ok recall-id)
  )
)

(define-public (close-recall (recall-id uint))
  (match (map-get? recalls { recall-id: recall-id })
    recall (ok (map-set recalls { recall-id: recall-id } (merge recall { status: "closed" })))
    (err u404)
  )
)

(define-read-only (get-recall (recall-id uint))
  (map-get? recalls { recall-id: recall-id })
)
