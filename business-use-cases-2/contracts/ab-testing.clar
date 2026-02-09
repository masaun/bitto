(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ab-tests uint {variant-a: (string-ascii 64), variant-b: (string-ascii 64), winner: (string-ascii 64)})
(define-data-var ab-nonce uint u0)

(define-public (create-ab-test (variant-a (string-ascii 64)) (variant-b (string-ascii 64)))
  (let ((test-id (+ (var-get ab-nonce) u1)))
    (map-set ab-tests test-id {variant-a: variant-a, variant-b: variant-b, winner: ""})
    (var-set ab-nonce test-id)
    (ok test-id)))

(define-read-only (get-ab-test (test-id uint))
  (ok (map-get? ab-tests test-id)))
