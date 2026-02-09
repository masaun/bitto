(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map governance-rules uint {rule-type: (string-ascii 64), enabled: bool, threshold: uint})
(define-data-var rule-nonce uint u0)

(define-public (create-rule (rule-type (string-ascii 64)) (threshold uint))
  (let ((rule-id (+ (var-get rule-nonce) u1)))
    (asserts! (<= threshold u100) ERR-INVALID-PARAMETER)
    (map-set governance-rules rule-id {rule-type: rule-type, enabled: true, threshold: threshold})
    (var-set rule-nonce rule-id)
    (ok rule-id)))

(define-read-only (get-rule (rule-id uint))
  (ok (map-get? governance-rules rule-id)))
