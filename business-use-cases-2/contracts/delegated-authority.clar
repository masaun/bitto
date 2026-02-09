(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map delegations {delegator: principal, delegate: principal} {voting-power: uint, active: bool})

(define-public (delegate-authority (delegate principal) (voting-power uint))
  (ok (map-set delegations {delegator: tx-sender, delegate: delegate} {voting-power: voting-power, active: true})))

(define-read-only (get-delegation (delegator principal) (delegate principal))
  (ok (map-get? delegations {delegator: delegator, delegate: delegate})))
