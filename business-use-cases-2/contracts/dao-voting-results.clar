(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map dao-voting-results {proposal-id: uint, voter: principal} {vote: bool, weight: uint, timestamp: uint})

(define-public (cast-dao-vote (proposal-id uint) (vote bool) (weight uint))
  (ok (map-set dao-voting-results {proposal-id: proposal-id, voter: tx-sender} {vote: vote, weight: weight, timestamp: stacks-block-height})))

(define-read-only (get-dao-vote (proposal-id uint) (voter principal))
  (ok (map-get? dao-voting-results {proposal-id: proposal-id, voter: voter})))
