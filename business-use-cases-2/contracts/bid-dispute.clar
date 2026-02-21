(define-map bid-disputes 
  uint 
  {
    bid-id: uint,
    disputer: principal,
    reason: (string-ascii 256),
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var dispute-nonce uint u0)

(define-read-only (get-bid-dispute (id uint))
  (map-get? bid-disputes id)
)

(define-public (file-dispute (bid-id uint) (reason (string-ascii 256)))
  (let ((id (+ (var-get dispute-nonce) u1)))
    (map-set bid-disputes id {
      bid-id: bid-id,
      disputer: tx-sender,
      reason: reason,
      status: "open",
      created-at: stacks-block-height
    })
    (var-set dispute-nonce id)
    (ok id)
  )
)

(define-public (resolve-dispute (id uint) (resolution (string-ascii 20)))
  (let ((dispute (unwrap! (map-get? bid-disputes id) (err u1))))
    (map-set bid-disputes id (merge dispute {status: resolution}))
    (ok true)
  )
)
