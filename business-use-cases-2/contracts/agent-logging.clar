(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map log-entries uint {agent: principal, level: (string-ascii 16), message: (string-ascii 256), timestamp: uint})
(define-data-var log-nonce uint u0)

(define-public (log-message (level (string-ascii 16)) (message (string-ascii 256)))
  (let ((log-id (+ (var-get log-nonce) u1)))
    (map-set log-entries log-id {agent: tx-sender, level: level, message: message, timestamp: stacks-block-height})
    (var-set log-nonce log-id)
    (ok log-id)))

(define-read-only (get-log (log-id uint))
  (ok (map-get? log-entries log-id)))
