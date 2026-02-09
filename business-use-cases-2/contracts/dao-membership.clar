(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map dao-membership principal {voting-power: uint, reputation: uint, joined-at: uint})

(define-public (join-dao (voting-power uint))
  (ok (map-set dao-membership tx-sender {voting-power: voting-power, reputation: u0, joined-at: stacks-block-height})))

(define-read-only (get-dao-membership (member principal))
  (ok (map-get? dao-membership member)))
