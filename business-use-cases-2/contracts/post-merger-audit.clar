(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map post-merger-audits uint {transaction-id: uint, auditor: principal, findings: (string-ascii 256), timestamp: uint})
(define-data-var pm-audit-nonce uint u0)

(define-public (conduct-post-merger-audit (transaction-id uint) (findings (string-ascii 256)))
  (let ((audit-id (+ (var-get pm-audit-nonce) u1)))
    (map-set post-merger-audits audit-id {transaction-id: transaction-id, auditor: tx-sender, findings: findings, timestamp: stacks-block-height})
    (var-set pm-audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-post-merger-audit (audit-id uint))
  (ok (map-get? post-merger-audits audit-id)))
