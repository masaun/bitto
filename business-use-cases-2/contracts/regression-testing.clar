(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map regression-tests uint {test-name: (string-ascii 128), passed: bool, regression-detected: bool})
(define-data-var regression-nonce uint u0)

(define-public (run-regression-test (test-name (string-ascii 128)) (passed bool) (regression-detected bool))
  (let ((test-id (+ (var-get regression-nonce) u1)))
    (map-set regression-tests test-id {test-name: test-name, passed: passed, regression-detected: regression-detected})
    (var-set regression-nonce test-id)
    (ok test-id)))

(define-read-only (get-regression-test (test-id uint))
  (ok (map-get? regression-tests test-id)))
