(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map error-logs uint {agent: principal, error-code: (string-ascii 32), message: (string-ascii 256), timestamp: uint})
(define-data-var error-nonce uint u0)

(define-public (log-error (error-code (string-ascii 32)) (message (string-ascii 256)))
  (let ((error-id (+ (var-get error-nonce) u1)))
    (map-set error-logs error-id {agent: tx-sender, error-code: error-code, message: message, timestamp: stacks-block-height})
    (var-set error-nonce error-id)
    (ok error-id)))

(define-read-only (get-error (error-id uint))
  (ok (map-get? error-logs error-id)))
