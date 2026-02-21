(define-constant contract-owner tx-sender)

(define-map reputations principal {score: uint, interactions: uint, last-updated: uint})

(define-public (update-reputation (user principal) (score-change uint))
  (let ((current (default-to {score: u0, interactions: u0, last-updated: u0} (map-get? reputations user))))
    (ok (map-set reputations user {score: (+ (get score current) score-change), interactions: (+ (get interactions current) u1), last-updated: stacks-block-height}))))

(define-read-only (get-reputation (user principal))
  (ok (map-get? reputations user)))
