(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map votes {proposal-id: uint, voter: principal} {vote: bool, weight: uint})

(define-public (cast-vote (proposal-id uint) (vote bool) (weight uint))
  (ok (map-set votes {proposal-id: proposal-id, voter: tx-sender} {vote: vote, weight: weight})))

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (ok (map-get? votes {proposal-id: proposal-id, voter: voter})))
