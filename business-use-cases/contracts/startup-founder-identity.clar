(define-map founders
  { founder-id: uint }
  {
    wallet: principal,
    name: (string-ascii 100),
    email-hash: (buff 32),
    verified: bool,
    registered-at: uint
  }
)

(define-data-var founder-nonce uint u0)

(define-public (register-founder (name (string-ascii 100)) (email-hash (buff 32)))
  (let ((founder-id (+ (var-get founder-nonce) u1)))
    (map-set founders
      { founder-id: founder-id }
      {
        wallet: tx-sender,
        name: name,
        email-hash: email-hash,
        verified: false,
        registered-at: stacks-block-height
      }
    )
    (var-set founder-nonce founder-id)
    (ok founder-id)
  )
)

(define-public (verify-founder (founder-id uint))
  (match (map-get? founders { founder-id: founder-id })
    founder (ok (map-set founders { founder-id: founder-id } (merge founder { verified: true })))
    (err u404)
  )
)

(define-read-only (get-founder (founder-id uint))
  (map-get? founders { founder-id: founder-id })
)
