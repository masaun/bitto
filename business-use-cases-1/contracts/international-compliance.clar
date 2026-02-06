(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map compliance-records
  { record-id: uint }
  {
    regulation: (string-ascii 100),
    compliant: bool,
    assessed-at: uint
  }
)

(define-data-var record-nonce uint u0)

(define-public (assess-compliance (regulation (string-ascii 100)) (compliant bool))
  (let ((record-id (+ (var-get record-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set compliance-records { record-id: record-id }
      {
        regulation: regulation,
        compliant: compliant,
        assessed-at: stacks-block-height
      }
    )
    (var-set record-nonce record-id)
    (ok record-id)
  )
)

(define-read-only (get-compliance-record (record-id uint))
  (ok (map-get? compliance-records { record-id: record-id }))
)

(define-read-only (get-record-count)
  (ok (var-get record-nonce))
)
