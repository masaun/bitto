(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map accountability-logs uint {action: (string-ascii 128), responsible-party: principal, timestamp: uint})
(define-data-var accountability-nonce uint u0)

(define-public (log-accountability (action (string-ascii 128)))
  (let ((log-id (+ (var-get accountability-nonce) u1)))
    (map-set accountability-logs log-id {action: action, responsible-party: tx-sender, timestamp: stacks-block-height})
    (var-set accountability-nonce log-id)
    (ok log-id)))

(define-read-only (get-accountability-log (log-id uint))
  (ok (map-get? accountability-logs log-id)))
