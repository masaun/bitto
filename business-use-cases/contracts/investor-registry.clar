(define-map investors
  { investor-id: uint }
  {
    wallet: principal,
    name: (string-ascii 100),
    investor-type: (string-ascii 50),
    accredited: bool,
    registered-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var investor-nonce uint u0)

(define-public (register-investor (name (string-ascii 100)) (investor-type (string-ascii 50)) (accredited bool))
  (let ((investor-id (+ (var-get investor-nonce) u1)))
    (map-set investors
      { investor-id: investor-id }
      {
        wallet: tx-sender,
        name: name,
        investor-type: investor-type,
        accredited: accredited,
        registered-at: stacks-block-height,
        status: "active"
      }
    )
    (var-set investor-nonce investor-id)
    (ok investor-id)
  )
)

(define-read-only (get-investor (investor-id uint))
  (map-get? investors { investor-id: investor-id })
)
