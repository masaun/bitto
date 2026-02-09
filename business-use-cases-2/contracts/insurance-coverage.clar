(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map insurance-policies uint {policy-type: (string-ascii 64), coverage-amount: uint, premium: uint, active: bool})
(define-data-var policy-nonce uint u0)

(define-public (purchase-insurance (policy-type (string-ascii 64)) (coverage-amount uint) (premium uint))
  (let ((policy-id (+ (var-get policy-nonce) u1)))
    (asserts! (> coverage-amount u0) ERR-INVALID-PARAMETER)
    (map-set insurance-policies policy-id {policy-type: policy-type, coverage-amount: coverage-amount, premium: premium, active: true})
    (var-set policy-nonce policy-id)
    (ok policy-id)))

(define-read-only (get-insurance-policy (policy-id uint))
  (ok (map-get? insurance-policies policy-id)))
