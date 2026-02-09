(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map adversarial-tests uint {attack-type: (string-ascii 64), success-rate: uint, mitigation: (string-ascii 128)})
(define-data-var adversarial-nonce uint u0)

(define-public (run-adversarial-test (attack-type (string-ascii 64)) (success-rate uint) (mitigation (string-ascii 128)))
  (let ((test-id (+ (var-get adversarial-nonce) u1)))
    (asserts! (<= success-rate u100) ERR-INVALID-PARAMETER)
    (map-set adversarial-tests test-id {attack-type: attack-type, success-rate: success-rate, mitigation: mitigation})
    (var-set adversarial-nonce test-id)
    (ok test-id)))

(define-read-only (get-adversarial-test (test-id uint))
  (ok (map-get? adversarial-tests test-id)))
