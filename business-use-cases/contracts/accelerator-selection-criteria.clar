(define-map criteria
  { criteria-id: uint }
  {
    program-id: uint,
    criterion-name: (string-ascii 100),
    weight: uint,
    min-score: uint,
    active: bool
  }
)

(define-data-var criteria-nonce uint u0)

(define-public (set-criteria (program uint) (name (string-ascii 100)) (weight uint) (min-score uint))
  (let ((criteria-id (+ (var-get criteria-nonce) u1)))
    (map-set criteria
      { criteria-id: criteria-id }
      {
        program-id: program,
        criterion-name: name,
        weight: weight,
        min-score: min-score,
        active: true
      }
    )
    (var-set criteria-nonce criteria-id)
    (ok criteria-id)
  )
)

(define-read-only (get-criteria (criteria-id uint))
  (map-get? criteria { criteria-id: criteria-id })
)
