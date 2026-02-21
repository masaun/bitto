(define-map collusion-flags 
  uint 
  {
    auction-id: uint,
    flagged-parties: (list 10 principal),
    reason: (string-ascii 256),
    severity: uint,
    flagged-at: uint
  }
)

(define-data-var flag-nonce uint u0)

(define-read-only (get-flag (id uint))
  (map-get? collusion-flags id)
)

(define-public (flag-collusion (auction-id uint) (parties (list 10 principal)) (reason (string-ascii 256)) (severity uint))
  (let ((id (+ (var-get flag-nonce) u1)))
    (map-set collusion-flags id {
      auction-id: auction-id,
      flagged-parties: parties,
      reason: reason,
      severity: severity,
      flagged-at: stacks-block-height
    })
    (var-set flag-nonce id)
    (ok id)
  )
)
