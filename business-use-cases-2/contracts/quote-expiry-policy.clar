(define-map quote-expiries 
  uint 
  {
    expiry-height: uint,
    auto-revoke: bool,
    revoked: bool
  }
)

(define-read-only (get-expiry (quote-id uint))
  (map-get? quote-expiries quote-id)
)

(define-public (set-expiry (quote-id uint) (expiry-height uint) (auto-revoke bool))
  (begin
    (map-set quote-expiries quote-id {
      expiry-height: expiry-height,
      auto-revoke: auto-revoke,
      revoked: false
    })
    (ok true)
  )
)

(define-read-only (is-expired (quote-id uint))
  (match (map-get? quote-expiries quote-id)
    expiry (ok (>= stacks-block-height (get expiry-height expiry)))
    (ok false)
  )
)

(define-public (revoke-expired (quote-id uint))
  (let ((expiry (unwrap! (map-get? quote-expiries quote-id) (err u1))))
    (asserts! (>= stacks-block-height (get expiry-height expiry)) (err u2))
    (map-set quote-expiries quote-id (merge expiry {revoked: true}))
    (ok true)
  )
)
