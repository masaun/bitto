(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map permissions {agent: principal, resource: (string-ascii 64)} {access-level: uint, granted: bool})

(define-public (grant-permission (resource (string-ascii 64)) (access-level uint))
  (begin
    (asserts! (<= access-level u3) ERR-INVALID-PARAMETER)
    (ok (map-set permissions {agent: tx-sender, resource: resource} {access-level: access-level, granted: true}))))

(define-public (revoke-permission (resource (string-ascii 64)))
  (ok (map-set permissions {agent: tx-sender, resource: resource} {access-level: u0, granted: false})))

(define-read-only (check-permission (agent principal) (resource (string-ascii 64)))
  (ok (map-get? permissions {agent: agent, resource: resource})))
