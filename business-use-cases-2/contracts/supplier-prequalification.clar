(define-map suppliers 
  principal 
  {
    certified: bool,
    score: uint,
    verified-at: uint
  }
)

(define-read-only (get-supplier (supplier principal))
  (map-get? suppliers supplier)
)

(define-public (prequalify-supplier (supplier principal) (score uint))
  (begin
    (map-set suppliers supplier {
      certified: true,
      score: score,
      verified-at: stacks-block-height
    })
    (ok true)
  )
)

(define-read-only (is-qualified (supplier principal))
  (match (map-get? suppliers supplier)
    s (ok (get certified s))
    (ok false)
  )
)
