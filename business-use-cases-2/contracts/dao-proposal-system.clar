(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map dao-proposals uint {proposer: principal, proposal-hash: (buff 32), votes-for: uint, votes-against: uint})
(define-data-var dao-proposal-nonce uint u0)

(define-public (create-dao-proposal (proposal-hash (buff 32)))
  (let ((proposal-id (+ (var-get dao-proposal-nonce) u1)))
    (map-set dao-proposals proposal-id {proposer: tx-sender, proposal-hash: proposal-hash, votes-for: u0, votes-against: u0})
    (var-set dao-proposal-nonce proposal-id)
    (ok proposal-id)))

(define-read-only (get-dao-proposal (proposal-id uint))
  (ok (map-get? dao-proposals proposal-id)))
