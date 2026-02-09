(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map override-policies uint {policy-type: (string-ascii 64), allowed-roles: uint, requires-justification: bool})
(define-data-var policy-nonce uint u0)

(define-public (create-override-policy (policy-type (string-ascii 64)) (allowed-roles uint))
  (let ((policy-id (+ (var-get policy-nonce) u1)))
    (map-set override-policies policy-id {policy-type: policy-type, allowed-roles: allowed-roles, requires-justification: true})
    (var-set policy-nonce policy-id)
    (ok policy-id)))

(define-read-only (get-override-policy (policy-id uint))
  (ok (map-get? override-policies policy-id)))
