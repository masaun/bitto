(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map policy-proposals uint {proposer: principal, policy-hash: (buff 32), status: (string-ascii 20)})
(define-data-var policy-nonce uint u0)

(define-public (submit-policy-proposal (policy-hash (buff 32)))
  (let ((proposal-id (+ (var-get policy-nonce) u1)))
    (map-set policy-proposals proposal-id {proposer: tx-sender, policy-hash: policy-hash, status: "pending"})
    (var-set policy-nonce proposal-id)
    (ok proposal-id)))

(define-read-only (get-policy-proposal (proposal-id uint))
  (ok (map-get? policy-proposals proposal-id)))
