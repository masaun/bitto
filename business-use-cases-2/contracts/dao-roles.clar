(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map dao-roles principal {role: (string-ascii 32), permissions: uint, assigned-at: uint})

(define-public (assign-dao-role (member principal) (role (string-ascii 32)) (permissions uint))
  (ok (map-set dao-roles member {role: role, permissions: permissions, assigned-at: stacks-block-height})))

(define-read-only (get-dao-role (member principal))
  (ok (map-get? dao-roles member)))
