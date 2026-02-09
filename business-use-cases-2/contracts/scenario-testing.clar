(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map scenario-tests uint {scenario: (string-ascii 128), expected-outcome: (string-ascii 64), actual-outcome: (string-ascii 64)})
(define-data-var scenario-nonce uint u0)

(define-public (test-scenario (scenario (string-ascii 128)) (expected-outcome (string-ascii 64)) (actual-outcome (string-ascii 64)))
  (let ((test-id (+ (var-get scenario-nonce) u1)))
    (map-set scenario-tests test-id {scenario: scenario, expected-outcome: expected-outcome, actual-outcome: actual-outcome})
    (var-set scenario-nonce test-id)
    (ok test-id)))

(define-read-only (get-scenario-test (test-id uint))
  (ok (map-get? scenario-tests test-id)))
