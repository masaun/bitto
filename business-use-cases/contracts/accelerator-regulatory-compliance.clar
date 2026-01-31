(define-map compliance-records
  { compliance-id: uint }
  {
    startup-id: uint,
    regulation: (string-ascii 100),
    status: (string-ascii 20),
    checked-at: uint,
    checker: principal,
    notes: (string-ascii 200)
  }
)

(define-data-var compliance-nonce uint u0)

(define-public (record-compliance (startup uint) (regulation (string-ascii 100)) (status (string-ascii 20)) (notes (string-ascii 200)))
  (let ((compliance-id (+ (var-get compliance-nonce) u1)))
    (map-set compliance-records
      { compliance-id: compliance-id }
      {
        startup-id: startup,
        regulation: regulation,
        status: status,
        checked-at: stacks-block-height,
        checker: tx-sender,
        notes: notes
      }
    )
    (var-set compliance-nonce compliance-id)
    (ok compliance-id)
  )
)

(define-read-only (get-compliance (compliance-id uint))
  (map-get? compliance-records { compliance-id: compliance-id })
)
