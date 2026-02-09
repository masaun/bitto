(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map deployment-logs uint {agent: principal, environment: (string-ascii 32), timestamp: uint, status: (string-ascii 20)})
(define-data-var deployment-nonce uint u0)

(define-public (log-deployment (agent principal) (environment (string-ascii 32)) (status (string-ascii 20)))
  (let ((log-id (+ (var-get deployment-nonce) u1)))
    (map-set deployment-logs log-id {agent: agent, environment: environment, timestamp: stacks-block-height, status: status})
    (var-set deployment-nonce log-id)
    (ok log-id)))

(define-read-only (get-deployment-log (log-id uint))
  (ok (map-get? deployment-logs log-id)))
