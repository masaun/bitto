(define-map valuations
  { valuation-id: uint }
  {
    startup-id: uint,
    valuation: uint,
    valuation-date: uint,
    method: (string-ascii 50),
    valuator: principal,
    notes: (string-ascii 200)
  }
)

(define-data-var valuation-nonce uint u0)

(define-public (record-valuation (startup uint) (valuation uint) (method (string-ascii 50)) (notes (string-ascii 200)))
  (let ((valuation-id (+ (var-get valuation-nonce) u1)))
    (map-set valuations
      { valuation-id: valuation-id }
      {
        startup-id: startup,
        valuation: valuation,
        valuation-date: stacks-block-height,
        method: method,
        valuator: tx-sender,
        notes: notes
      }
    )
    (var-set valuation-nonce valuation-id)
    (ok valuation-id)
  )
)

(define-read-only (get-valuation (valuation-id uint))
  (map-get? valuations { valuation-id: valuation-id })
)
