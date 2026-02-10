(define-map quote-access 
  {quote-id: uint, user: principal}
  {
    can-view: bool,
    can-edit: bool,
    granted-at: uint
  }
)

(define-read-only (get-access (quote-id uint) (user principal))
  (map-get? quote-access {quote-id: quote-id, user: user})
)

(define-public (grant-access (quote-id uint) (user principal) (can-view bool) (can-edit bool))
  (begin
    (map-set quote-access {quote-id: quote-id, user: user} {
      can-view: can-view,
      can-edit: can-edit,
      granted-at: stacks-block-height
    })
    (ok true)
  )
)

(define-public (revoke-access (quote-id uint) (user principal))
  (begin
    (map-delete quote-access {quote-id: quote-id, user: user})
    (ok true)
  )
)

(define-read-only (check-view-permission (quote-id uint) (user principal))
  (match (map-get? quote-access {quote-id: quote-id, user: user})
    access (ok (get can-view access))
    (ok false)
  )
)
