(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map access-policies uint {resource: (string-ascii 64), min-role: uint, enabled: bool})
(define-data-var policy-nonce uint u0)

(define-public (create-policy (resource (string-ascii 64)) (min-role uint))
  (let ((policy-id (+ (var-get policy-nonce) u1)))
    (map-set access-policies policy-id {resource: resource, min-role: min-role, enabled: true})
    (var-set policy-nonce policy-id)
    (ok policy-id)))

(define-read-only (get-policy (policy-id uint))
  (ok (map-get? access-policies policy-id)))
