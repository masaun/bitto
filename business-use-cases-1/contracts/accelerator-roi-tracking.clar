(define-map roi-tracking
  { roi-id: uint }
  {
    program-id: uint,
    total-invested: uint,
    current-portfolio-value: uint,
    realized-returns: uint,
    roi-percentage: uint,
    calculated-at: uint
  }
)

(define-data-var roi-nonce uint u0)

(define-public (calculate-roi (program uint) (invested uint) (portfolio-value uint) (realized uint))
  (let 
    (
      (roi-id (+ (var-get roi-nonce) u1))
      (total-return (+ portfolio-value realized))
      (roi (/ (* (- total-return invested) u100) invested))
    )
    (map-set roi-tracking
      { roi-id: roi-id }
      {
        program-id: program,
        total-invested: invested,
        current-portfolio-value: portfolio-value,
        realized-returns: realized,
        roi-percentage: roi,
        calculated-at: stacks-block-height
      }
    )
    (var-set roi-nonce roi-id)
    (ok roi-id)
  )
)

(define-read-only (get-roi (roi-id uint))
  (map-get? roi-tracking { roi-id: roi-id })
)
