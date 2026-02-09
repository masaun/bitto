(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map quadratic-votes {proposal-id: uint, voter: principal} {credits-used: uint, effective-votes: uint})

(define-public (cast-quadratic-vote (proposal-id uint) (credits-used uint))
  (let ((effective-votes (sqrti credits-used)))
    (ok (map-set quadratic-votes {proposal-id: proposal-id, voter: tx-sender} {credits-used: credits-used, effective-votes: effective-votes}))))

(define-read-only (get-quadratic-vote (proposal-id uint) (voter principal))
  (ok (map-get? quadratic-votes {proposal-id: proposal-id, voter: voter})))
