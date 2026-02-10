(define-map release-conditions 
  {escrow-id: uint, condition-id: uint}
  {
    description: (string-ascii 256),
    met: bool,
    verified-at: uint
  }
)

(define-read-only (get-release-condition (escrow-id uint) (condition-id uint))
  (map-get? release-conditions {escrow-id: escrow-id, condition-id: condition-id})
)

(define-public (add-release-condition (escrow-id uint) (condition-id uint) (description (string-ascii 256)))
  (begin
    (map-set release-conditions {escrow-id: escrow-id, condition-id: condition-id} {
      description: description,
      met: false,
      verified-at: u0
    })
    (ok true)
  )
)

(define-public (mark-condition-met-escrow (escrow-id uint) (condition-id uint))
  (let ((cond (unwrap! (map-get? release-conditions {escrow-id: escrow-id, condition-id: condition-id}) (err u1))))
    (map-set release-conditions {escrow-id: escrow-id, condition-id: condition-id} (merge cond {met: true, verified-at: stacks-block-height}))
    (ok true)
  )
)
