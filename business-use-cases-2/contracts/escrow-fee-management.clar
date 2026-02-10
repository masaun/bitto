(define-map escrow-fees 
  uint 
  {
    base-fee: uint,
    percentage-fee: uint,
    collected: uint
  }
)

(define-read-only (get-escrow-fee (escrow-id uint))
  (map-get? escrow-fees escrow-id)
)

(define-public (set-escrow-fee (escrow-id uint) (base-fee uint) (percentage-fee uint))
  (begin
    (map-set escrow-fees escrow-id {
      base-fee: base-fee,
      percentage-fee: percentage-fee,
      collected: u0
    })
    (ok true)
  )
)

(define-public (collect-escrow-fee (escrow-id uint) (amount uint))
  (let ((fee (unwrap! (map-get? escrow-fees escrow-id) (err u1))))
    (map-set escrow-fees escrow-id (merge fee {collected: (+ (get collected fee) amount)}))
    (ok true)
  )
)
