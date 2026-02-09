(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map routing-rules uint {model-id: uint, endpoint: (string-ascii 128), priority: uint, active: bool})
(define-data-var rule-nonce uint u0)

(define-public (create-routing-rule (model-id uint) (endpoint (string-ascii 128)) (priority uint))
  (let ((rule-id (+ (var-get rule-nonce) u1)))
    (map-set routing-rules rule-id {model-id: model-id, endpoint: endpoint, priority: priority, active: true})
    (var-set rule-nonce rule-id)
    (ok rule-id)))

(define-read-only (get-routing-rule (rule-id uint))
  (ok (map-get? routing-rules rule-id)))
