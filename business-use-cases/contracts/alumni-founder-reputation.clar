(define-map founder-reputation
  { reputation-id: uint }
  {
    founder-id: uint,
    reputation-score: uint,
    successful-exits: uint,
    failed-ventures: uint,
    calculated-at: uint,
    verified: bool
  }
)

(define-data-var reputation-nonce uint u0)

(define-public (calculate-reputation (founder uint) (score uint) (exits uint) (failures uint))
  (let ((reputation-id (+ (var-get reputation-nonce) u1)))
    (map-set founder-reputation
      { reputation-id: reputation-id }
      {
        founder-id: founder,
        reputation-score: score,
        successful-exits: exits,
        failed-ventures: failures,
        calculated-at: stacks-block-height,
        verified: false
      }
    )
    (var-set reputation-nonce reputation-id)
    (ok reputation-id)
  )
)

(define-public (verify-reputation (reputation-id uint))
  (match (map-get? founder-reputation { reputation-id: reputation-id })
    reputation (ok (map-set founder-reputation { reputation-id: reputation-id } (merge reputation { verified: true })))
    (err u404)
  )
)

(define-read-only (get-founder-reputation (reputation-id uint))
  (map-get? founder-reputation { reputation-id: reputation-id })
)
