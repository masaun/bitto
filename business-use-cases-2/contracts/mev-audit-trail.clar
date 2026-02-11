(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map audit-logs
  { log-id: uint }
  {
    event-type: (string-ascii 50),
    data: (buff 512),
    timestamp: uint,
    actor: principal
  }
)

(define-data-var log-counter uint u0)

(define-read-only (get-log (log-id uint))
  (map-get? audit-logs { log-id: log-id })
)

(define-read-only (get-count)
  (ok (var-get log-counter))
)

(define-public (add-log (event-type (string-ascii 50)) (data (buff 512)))
  (let ((log-id (var-get log-counter)))
    (map-set audit-logs
      { log-id: log-id }
      {
        event-type: event-type,
        data: data,
        timestamp: stacks-block-height,
        actor: tx-sender
      }
    )
    (var-set log-counter (+ log-id u1))
    (ok log-id)
  )
)

(define-read-only (get-logs-by-actor (actor principal))
  (ok (var-get log-counter))
)
