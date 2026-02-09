(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map telemetry-events uint {agent: principal, event-type: (string-ascii 64), timestamp: uint})
(define-data-var event-nonce uint u0)

(define-public (log-telemetry (event-type (string-ascii 64)))
  (let ((event-id (+ (var-get event-nonce) u1)))
    (map-set telemetry-events event-id {agent: tx-sender, event-type: event-type, timestamp: stacks-block-height})
    (var-set event-nonce event-id)
    (ok event-id)))

(define-read-only (get-telemetry (event-id uint))
  (ok (map-get? telemetry-events event-id)))
