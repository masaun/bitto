(define-map upgrades 
  uint 
  {
    subscription-id: uint,
    old-plan: uint,
    new-plan: uint,
    upgraded-at: uint,
    upgraded-by: principal
  }
)

(define-data-var upgrade-nonce uint u0)

(define-read-only (get-upgrade (id uint))
  (map-get? upgrades id)
)

(define-public (upgrade-subscription (subscription-id uint) (old-plan uint) (new-plan uint))
  (let ((id (+ (var-get upgrade-nonce) u1)))
    (map-set upgrades id {
      subscription-id: subscription-id,
      old-plan: old-plan,
      new-plan: new-plan,
      upgraded-at: stacks-block-height,
      upgraded-by: tx-sender
    })
    (var-set upgrade-nonce id)
    (ok id)
  )
)
