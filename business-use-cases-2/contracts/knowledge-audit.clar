(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map kb-audit-log uint {kb-id: uint, action: (string-ascii 64), actor: principal, timestamp: uint})
(define-data-var kb-audit-nonce uint u0)

(define-public (log-kb-action (kb-id uint) (action (string-ascii 64)))
  (let ((log-id (+ (var-get kb-audit-nonce) u1)))
    (map-set kb-audit-log log-id {kb-id: kb-id, action: action, actor: tx-sender, timestamp: stacks-block-height})
    (var-set kb-audit-nonce log-id)
    (ok log-id)))

(define-read-only (get-kb-audit (log-id uint))
  (ok (map-get? kb-audit-log log-id)))
