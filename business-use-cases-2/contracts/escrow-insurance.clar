(define-map escrow-insurance-policies 
  uint 
  {
    escrow-id: uint,
    coverage-amount: uint,
    premium: uint,
    insurer: principal,
    active: bool
  }
)

(define-data-var insurance-nonce uint u0)

(define-read-only (get-escrow-insurance (id uint))
  (map-get? escrow-insurance-policies id)
)

(define-public (insure-escrow (escrow-id uint) (coverage uint) (premium uint) (insurer principal))
  (let ((id (+ (var-get insurance-nonce) u1)))
    (map-set escrow-insurance-policies id {
      escrow-id: escrow-id,
      coverage-amount: coverage,
      premium: premium,
      insurer: insurer,
      active: true
    })
    (var-set insurance-nonce id)
    (ok id)
  )
)
