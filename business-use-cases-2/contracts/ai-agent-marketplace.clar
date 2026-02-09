(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map agents uint {name: (string-ascii 64), owner: principal, price: uint, active: bool})
(define-data-var agent-nonce uint u0)

(define-public (list-agent (name (string-ascii 64)) (price uint))
  (let ((agent-id (+ (var-get agent-nonce) u1)))
    (asserts! (> price u0) ERR-INVALID-PARAMETER)
    (map-set agents agent-id {name: name, owner: tx-sender, price: price, active: true})
    (var-set agent-nonce agent-id)
    (ok agent-id)))

(define-read-only (get-agent (agent-id uint))
  (ok (map-get? agents agent-id)))
