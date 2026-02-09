(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map trial-access {agent-id: uint, user: principal} {granted: bool, expiry: uint, converted: bool})

(define-public (grant-trial (agent-id uint) (user principal) (expiry uint))
  (begin
    (asserts! (> expiry stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set trial-access {agent-id: agent-id, user: user} {granted: true, expiry: expiry, converted: false}))))

(define-read-only (get-trial (agent-id uint) (user principal))
  (ok (map-get? trial-access {agent-id: agent-id, user: user})))
