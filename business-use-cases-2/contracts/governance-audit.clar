(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map governance-audit-log uint {action: (string-ascii 64), actor: principal, proposal-id: uint, timestamp: uint})
(define-data-var gov-audit-nonce uint u0)

(define-public (log-governance-action (action (string-ascii 64)) (proposal-id uint))
  (let ((log-id (+ (var-get gov-audit-nonce) u1)))
    (map-set governance-audit-log log-id {action: action, actor: tx-sender, proposal-id: proposal-id, timestamp: stacks-block-height})
    (var-set gov-audit-nonce log-id)
    (ok log-id)))

(define-read-only (get-governance-audit (log-id uint))
  (ok (map-get? governance-audit-log log-id)))
