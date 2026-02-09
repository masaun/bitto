(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map stress-tests uint {test-type: (string-ascii 64), load-level: uint, passed: bool})
(define-data-var stress-nonce uint u0)

(define-public (run-stress-test (test-type (string-ascii 64)) (load-level uint) (passed bool))
  (let ((test-id (+ (var-get stress-nonce) u1)))
    (map-set stress-tests test-id {test-type: test-type, load-level: load-level, passed: passed})
    (var-set stress-nonce test-id)
    (ok test-id)))

(define-read-only (get-stress-test (test-id uint))
  (ok (map-get? stress-tests test-id)))
