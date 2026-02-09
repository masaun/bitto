(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map roles uint {name: (string-ascii 64), permissions: uint, active: bool})
(define-data-var role-nonce uint u0)

(define-public (create-role (name (string-ascii 64)) (permissions uint))
  (let ((role-id (+ (var-get role-nonce) u1)))
    (map-set roles role-id {name: name, permissions: permissions, active: true})
    (var-set role-nonce role-id)
    (ok role-id)))

(define-read-only (get-role (role-id uint))
  (ok (map-get? roles role-id)))
