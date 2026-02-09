(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map subscriptions principal {plan: (string-ascii 32), amount: uint, next-billing: uint, active: bool})

(define-public (create-subscription (plan (string-ascii 32)) (amount uint) (next-billing uint))
  (begin
    (asserts! (and (> amount u0) (> next-billing stacks-block-height)) ERR-INVALID-PARAMETER)
    (ok (map-set subscriptions tx-sender {plan: plan, amount: amount, next-billing: next-billing, active: true}))))

(define-read-only (get-subscription (user principal))
  (ok (map-get? subscriptions user)))
