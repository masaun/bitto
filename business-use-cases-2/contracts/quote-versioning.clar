(define-map quote-versions 
  {quote-id: uint, version: uint}
  {
    data: (string-ascii 512),
    created-at: uint,
    created-by: principal
  }
)

(define-map latest-version uint uint)

(define-read-only (get-version (quote-id uint) (version uint))
  (map-get? quote-versions {quote-id: quote-id, version: version})
)

(define-read-only (get-latest-version (quote-id uint))
  (map-get? latest-version quote-id)
)

(define-public (create-version (quote-id uint) (data (string-ascii 512)))
  (let ((next-version (+ (default-to u0 (map-get? latest-version quote-id)) u1)))
    (map-set quote-versions {quote-id: quote-id, version: next-version} {
      data: data,
      created-at: stacks-block-height,
      created-by: tx-sender
    })
    (map-set latest-version quote-id next-version)
    (ok next-version)
  )
)
