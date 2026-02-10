(define-map escrow-arbitrations 
  uint 
  {
    dispute-id: uint,
    arbitrator: principal,
    ruling: (string-ascii 128),
    ruled-at: uint
  }
)

(define-data-var arbitration-nonce uint u0)

(define-read-only (get-escrow-arbitration (id uint))
  (map-get? escrow-arbitrations id)
)

(define-public (arbitrate-escrow (dispute-id uint) (ruling (string-ascii 128)))
  (let ((id (+ (var-get arbitration-nonce) u1)))
    (map-set escrow-arbitrations id {
      dispute-id: dispute-id,
      arbitrator: tx-sender,
      ruling: ruling,
      ruled-at: stacks-block-height
    })
    (var-set arbitration-nonce id)
    (ok id)
  )
)
