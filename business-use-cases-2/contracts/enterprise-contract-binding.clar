(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map contract-bindings uint {tenant: principal, contract-hash: (buff 32), active: bool})
(define-data-var binding-nonce uint u0)

(define-public (bind-contract (contract-hash (buff 32)))
  (let ((binding-id (+ (var-get binding-nonce) u1)))
    (map-set contract-bindings binding-id {tenant: tx-sender, contract-hash: contract-hash, active: true})
    (var-set binding-nonce binding-id)
    (ok binding-id)))

(define-read-only (get-binding (binding-id uint))
  (ok (map-get? contract-bindings binding-id)))
