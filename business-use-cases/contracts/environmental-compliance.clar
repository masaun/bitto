(define-map compliance-records
  { record-id: uint }
  {
    facility-id: uint,
    regulation: (string-ascii 100),
    status: (string-ascii 20),
    verified-at: uint,
    verifier: principal,
    next-audit: uint
  }
)

(define-data-var record-nonce uint u0)

(define-public (record-compliance (facility uint) (regulation (string-ascii 100)) (status (string-ascii 20)) (next-audit uint))
  (let ((record-id (+ (var-get record-nonce) u1)))
    (map-set compliance-records
      { record-id: record-id }
      {
        facility-id: facility,
        regulation: regulation,
        status: status,
        verified-at: stacks-block-height,
        verifier: tx-sender,
        next-audit: next-audit
      }
    )
    (var-set record-nonce record-id)
    (ok record-id)
  )
)

(define-read-only (get-compliance (record-id uint))
  (map-get? compliance-records { record-id: record-id })
)
