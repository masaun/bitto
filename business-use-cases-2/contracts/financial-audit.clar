(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map financial-audits uint {period: (string-ascii 32), auditor: principal, findings: (string-ascii 256), approved: bool})
(define-data-var financial-audit-nonce uint u0)

(define-public (conduct-financial-audit (period (string-ascii 32)) (findings (string-ascii 256)) (approved bool))
  (let ((audit-id (+ (var-get financial-audit-nonce) u1)))
    (map-set financial-audits audit-id {period: period, auditor: tx-sender, findings: findings, approved: approved})
    (var-set financial-audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-financial-audit (audit-id uint))
  (ok (map-get? financial-audits audit-id)))
