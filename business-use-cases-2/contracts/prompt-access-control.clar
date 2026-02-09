(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map prompt-access {prompt-id: uint, user: principal} {granted: bool, access-level: uint})

(define-public (grant-access (prompt-id uint) (user principal) (access-level uint))
  (begin
    (asserts! (<= access-level u3) ERR-INVALID-PARAMETER)
    (ok (map-set prompt-access {prompt-id: prompt-id, user: user} {granted: true, access-level: access-level}))))

(define-public (revoke-access (prompt-id uint) (user principal))
  (ok (map-set prompt-access {prompt-id: prompt-id, user: user} {granted: false, access-level: u0})))

(define-read-only (check-access (prompt-id uint) (user principal))
  (ok (map-get? prompt-access {prompt-id: prompt-id, user: user})))
