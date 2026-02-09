(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map dao-proposals uint {proposer: principal, description: (string-ascii 256), votes-for: uint, votes-against: uint})
(define-data-var proposal-nonce uint u0)

(define-public (create-proposal (description (string-ascii 256)))
  (let ((proposal-id (+ (var-get proposal-nonce) u1)))
    (map-set dao-proposals proposal-id {proposer: tx-sender, description: description, votes-for: u0, votes-against: u0})
    (var-set proposal-nonce proposal-id)
    (ok proposal-id)))

(define-read-only (get-proposal (proposal-id uint))
  (ok (map-get? dao-proposals proposal-id)))
