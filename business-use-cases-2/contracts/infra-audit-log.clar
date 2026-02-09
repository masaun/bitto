(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map infra-audit-logs uint {resource-id: uint, action: (string-ascii 64), actor: principal, timestamp: uint})
(define-data-var infra-audit-nonce uint u0)

(define-public (log-infra-action (resource-id uint) (action (string-ascii 64)))
  (let ((log-id (+ (var-get infra-audit-nonce) u1)))
    (map-set infra-audit-logs log-id {resource-id: resource-id, action: action, actor: tx-sender, timestamp: stacks-block-height})
    (var-set infra-audit-nonce log-id)
    (ok log-id)))

(define-read-only (get-infra-audit-log (log-id uint))
  (ok (map-get? infra-audit-logs log-id)))
