(define-map iso-compliance uint {
  entity: principal,
  standard: (string-ascii 50),
  certification-date: uint,
  expiry-date: uint,
  certifying-body: principal,
  status: (string-ascii 20)
})

(define-data-var compliance-counter uint u0)

(define-read-only (get-iso-compliance (compliance-id uint))
  (map-get? iso-compliance compliance-id))

(define-public (certify-iso-compliance (entity principal) (standard (string-ascii 50)) (duration uint))
  (let ((new-id (+ (var-get compliance-counter) u1)))
    (map-set iso-compliance new-id {
      entity: entity,
      standard: standard,
      certification-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      certifying-body: tx-sender,
      status: "certified"
    })
    (var-set compliance-counter new-id)
    (ok new-id)))
