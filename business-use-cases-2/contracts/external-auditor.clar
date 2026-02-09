(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map external-audits uint {auditor-org: (string-ascii 128), scope: (string-ascii 128), report-hash: (buff 32)})
(define-data-var external-audit-nonce uint u0)

(define-public (register-external-audit (auditor-org (string-ascii 128)) (scope (string-ascii 128)) (report-hash (buff 32)))
  (let ((audit-id (+ (var-get external-audit-nonce) u1)))
    (map-set external-audits audit-id {auditor-org: auditor-org, scope: scope, report-hash: report-hash})
    (var-set external-audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-external-audit (audit-id uint))
  (ok (map-get? external-audits audit-id)))
