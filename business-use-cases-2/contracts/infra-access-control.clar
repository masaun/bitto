(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map infra-access {resource-id: uint, user: principal} {access-level: uint, granted: bool})

(define-public (grant-infra-access (resource-id uint) (user principal) (access-level uint))
  (begin
    (asserts! (<= access-level u3) ERR-INVALID-PARAMETER)
    (ok (map-set infra-access {resource-id: resource-id, user: user} {access-level: access-level, granted: true}))))

(define-read-only (check-infra-access (resource-id uint) (user principal))
  (ok (map-get? infra-access {resource-id: resource-id, user: user})))
