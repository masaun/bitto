(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map dao-treasury uint {balance: uint, last-deposit: uint, last-withdrawal: uint})

(define-public (update-treasury-balance (treasury-id uint) (balance uint))
  (ok (map-set dao-treasury treasury-id {balance: balance, last-deposit: stacks-block-height, last-withdrawal: u0})))

(define-read-only (get-treasury-balance (treasury-id uint))
  (ok (map-get? dao-treasury treasury-id)))
