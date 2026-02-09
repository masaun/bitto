(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map performance-audits uint {metric: (string-ascii 64), value: uint, threshold: uint, passed: bool})
(define-data-var perf-audit-nonce uint u0)

(define-public (audit-performance (metric (string-ascii 64)) (value uint) (threshold uint) (passed bool))
  (let ((audit-id (+ (var-get perf-audit-nonce) u1)))
    (map-set performance-audits audit-id {metric: metric, value: value, threshold: threshold, passed: passed})
    (var-set perf-audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-performance-audit (audit-id uint))
  (ok (map-get? performance-audits audit-id)))
