(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map reputation-scores principal {reputation: uint, contributions: uint, last-updated: uint})

(define-public (update-reputation (member principal) (reputation uint) (contributions uint))
  (begin
    (asserts! (<= reputation u1000) ERR-INVALID-PARAMETER)
    (ok (map-set reputation-scores member {reputation: reputation, contributions: contributions, last-updated: stacks-block-height}))))

(define-read-only (get-reputation (member principal))
  (ok (map-get? reputation-scores member)))
