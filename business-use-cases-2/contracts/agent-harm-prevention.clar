(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map harm-rules uint {category: (string-ascii 64), severity: uint, blocked: bool})
(define-data-var rule-nonce uint u0)

(define-public (add-harm-rule (category (string-ascii 64)) (severity uint) (blocked bool))
  (let ((rule-id (+ (var-get rule-nonce) u1)))
    (asserts! (<= severity u10) ERR-INVALID-PARAMETER)
    (map-set harm-rules rule-id {category: category, severity: severity, blocked: blocked})
    (var-set rule-nonce rule-id)
    (ok rule-id)))

(define-read-only (get-harm-rule (rule-id uint))
  (ok (map-get? harm-rules rule-id)))
