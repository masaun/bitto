(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map audit-log uint {agent: principal, action: (string-ascii 64), memory-id: uint, timestamp: uint})
(define-data-var audit-nonce uint u0)

(define-public (log-action (action (string-ascii 64)) (memory-id uint))
  (let ((log-id (+ (var-get audit-nonce) u1)))
    (map-set audit-log log-id {agent: tx-sender, action: action, memory-id: memory-id, timestamp: stacks-block-height})
    (var-set audit-nonce log-id)
    (ok log-id)))

(define-read-only (get-log (log-id uint))
  (ok (map-get? audit-log log-id)))
