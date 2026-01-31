(define-map substances
  { substance-id: uint }
  {
    cas-number: (string-ascii 50),
    name: (string-ascii 100),
    molecular-formula: (string-ascii 100),
    hazard-class: (string-ascii 50),
    registered-by: principal,
    registered-at: uint
  }
)

(define-data-var substance-nonce uint u0)

(define-public (register-substance (cas (string-ascii 50)) (name (string-ascii 100)) (formula (string-ascii 100)) (hazard (string-ascii 50)))
  (let ((substance-id (+ (var-get substance-nonce) u1)))
    (map-set substances
      { substance-id: substance-id }
      {
        cas-number: cas,
        name: name,
        molecular-formula: formula,
        hazard-class: hazard,
        registered-by: tx-sender,
        registered-at: stacks-block-height
      }
    )
    (var-set substance-nonce substance-id)
    (ok substance-id)
  )
)

(define-read-only (get-substance (substance-id uint))
  (map-get? substances { substance-id: substance-id })
)
