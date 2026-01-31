(define-map equity-allocations
  { allocation-id: uint }
  {
    startup-id: uint,
    investor: principal,
    shares: uint,
    share-price: uint,
    allocated-at: uint,
    vesting-schedule: (string-ascii 100)
  }
)

(define-data-var allocation-nonce uint u0)

(define-public (allocate-equity (startup uint) (investor principal) (shares uint) (price uint) (vesting (string-ascii 100)))
  (let ((allocation-id (+ (var-get allocation-nonce) u1)))
    (map-set equity-allocations
      { allocation-id: allocation-id }
      {
        startup-id: startup,
        investor: investor,
        shares: shares,
        share-price: price,
        allocated-at: stacks-block-height,
        vesting-schedule: vesting
      }
    )
    (var-set allocation-nonce allocation-id)
    (ok allocation-id)
  )
)

(define-read-only (get-equity-allocation (allocation-id uint))
  (map-get? equity-allocations { allocation-id: allocation-id })
)
