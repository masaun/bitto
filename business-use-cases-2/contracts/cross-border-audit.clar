(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map cross-border-audit-log uint {transfer-id: uint, auditor: principal, findings: (string-ascii 256), timestamp: uint})
(define-data-var cb-audit-nonce uint u0)

(define-public (log-cross-border-audit (transfer-id uint) (findings (string-ascii 256)))
  (let ((audit-id (+ (var-get cb-audit-nonce) u1)))
    (map-set cross-border-audit-log audit-id {transfer-id: transfer-id, auditor: tx-sender, findings: findings, timestamp: stacks-block-height})
    (var-set cb-audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-cross-border-audit (audit-id uint))
  (ok (map-get? cross-border-audit-log audit-id)))
