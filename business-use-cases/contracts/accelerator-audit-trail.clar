(define-map audit-trail
  { audit-id: uint }
  {
    action-type: (string-ascii 100),
    entity-id: uint,
    actor: principal,
    timestamp: uint,
    details: (string-ascii 500),
    hash: (buff 32)
  }
)

(define-data-var audit-nonce uint u0)

(define-public (log-action (action-type (string-ascii 100)) (entity uint) (details (string-ascii 500)) (hash (buff 32)))
  (let ((audit-id (+ (var-get audit-nonce) u1)))
    (map-set audit-trail
      { audit-id: audit-id }
      {
        action-type: action-type,
        entity-id: entity,
        actor: tx-sender,
        timestamp: stacks-block-height,
        details: details,
        hash: hash
      }
    )
    (var-set audit-nonce audit-id)
    (ok audit-id)
  )
)

(define-read-only (get-audit-log (audit-id uint))
  (map-get? audit-trail { audit-id: audit-id })
)
