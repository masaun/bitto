(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map copilot-sessions uint {user: principal, agent: principal, active: bool, suggestions: uint})
(define-data-var session-nonce uint u0)

(define-public (start-copilot (agent principal))
  (let ((session-id (+ (var-get session-nonce) u1)))
    (map-set copilot-sessions session-id {user: tx-sender, agent: agent, active: true, suggestions: u0})
    (var-set session-nonce session-id)
    (ok session-id)))

(define-read-only (get-copilot-session (session-id uint))
  (ok (map-get? copilot-sessions session-id)))
