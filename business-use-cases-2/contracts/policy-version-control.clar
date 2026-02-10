(define-map policy-versions 
  {policy-id: uint, version: uint}
  {
    content: (string-ascii 512),
    created-by: principal,
    created-at: uint,
    active: bool
  }
)

(define-map current-version uint uint)

(define-read-only (get-policy-version (policy-id uint) (version uint))
  (map-get? policy-versions {policy-id: policy-id, version: version})
)

(define-public (create-policy-version (policy-id uint) (content (string-ascii 512)))
  (let ((next-ver (+ (default-to u0 (map-get? current-version policy-id)) u1)))
    (map-set policy-versions {policy-id: policy-id, version: next-ver} {
      content: content,
      created-by: tx-sender,
      created-at: stacks-block-height,
      active: true
    })
    (map-set current-version policy-id next-ver)
    (ok next-ver)
  )
)
