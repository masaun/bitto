(define-map audit-trails uint {
  entity: principal,
  action-type: (string-ascii 50),
  resource-id: (string-ascii 100),
  timestamp: uint,
  metadata: (string-utf8 256)
})

(define-data-var trail-counter uint u0)

(define-read-only (get-audit-trail (trail-id uint))
  (map-get? audit-trails trail-id))

(define-public (record-action (action-type (string-ascii 50)) (resource-id (string-ascii 100)) (metadata (string-utf8 256)))
  (let ((new-id (+ (var-get trail-counter) u1)))
    (map-set audit-trails new-id {
      entity: tx-sender,
      action-type: action-type,
      resource-id: resource-id,
      timestamp: stacks-block-height,
      metadata: metadata
    })
    (var-set trail-counter new-id)
    (ok new-id)))
