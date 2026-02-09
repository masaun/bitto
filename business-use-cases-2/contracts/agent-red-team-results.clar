(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map red-team-results uint {agent: principal, test-type: (string-ascii 64), passed: bool, findings: uint})
(define-data-var result-nonce uint u0)

(define-public (submit-results (test-type (string-ascii 64)) (passed bool) (findings uint))
  (let ((result-id (+ (var-get result-nonce) u1)))
    (map-set red-team-results result-id {agent: tx-sender, test-type: test-type, passed: passed, findings: findings})
    (var-set result-nonce result-id)
    (ok result-id)))

(define-read-only (get-results (result-id uint))
  (ok (map-get? red-team-results result-id)))
