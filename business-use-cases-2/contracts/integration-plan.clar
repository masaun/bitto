(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map integration-plans uint {transaction-id: uint, plan-hash: (buff 32), completed: bool})
(define-data-var integration-nonce uint u0)

(define-public (create-integration-plan (transaction-id uint) (plan-hash (buff 32)))
  (let ((plan-id (+ (var-get integration-nonce) u1)))
    (map-set integration-plans plan-id {transaction-id: transaction-id, plan-hash: plan-hash, completed: false})
    (var-set integration-nonce plan-id)
    (ok plan-id)))

(define-read-only (get-integration-plan (plan-id uint))
  (ok (map-get? integration-plans plan-id)))
