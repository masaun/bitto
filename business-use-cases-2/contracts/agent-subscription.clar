(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map subscriptions {agent-id: uint, subscriber: principal} {active: bool, expiry: uint, auto-renew: bool})

(define-public (subscribe (agent-id uint) (expiry uint) (auto-renew bool))
  (begin
    (asserts! (> expiry stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set subscriptions {agent-id: agent-id, subscriber: tx-sender} {active: true, expiry: expiry, auto-renew: auto-renew}))))

(define-read-only (get-subscription (agent-id uint) (subscriber principal))
  (ok (map-get? subscriptions {agent-id: agent-id, subscriber: subscriber})))
