(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map security-audits uint {system: (string-ascii 64), vulnerabilities: uint, risk-level: uint})
(define-data-var security-audit-nonce uint u0)

(define-public (perform-security-audit (system (string-ascii 64)) (vulnerabilities uint) (risk-level uint))
  (let ((audit-id (+ (var-get security-audit-nonce) u1)))
    (asserts! (<= risk-level u5) ERR-INVALID-PARAMETER)
    (map-set security-audits audit-id {system: system, vulnerabilities: vulnerabilities, risk-level: risk-level})
    (var-set security-audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-security-audit (audit-id uint))
  (ok (map-get? security-audits audit-id)))
