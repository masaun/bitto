(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ma-transactions uint {acquirer: principal, target: principal, ai-asset-value: uint, status: (string-ascii 20)})
(define-data-var ma-nonce uint u0)

(define-public (register-ma-transaction (target principal) (ai-asset-value uint))
  (let ((transaction-id (+ (var-get ma-nonce) u1)))
    (map-set ma-transactions transaction-id {acquirer: tx-sender, target: target, ai-asset-value: ai-asset-value, status: "pending"})
    (var-set ma-nonce transaction-id)
    (ok transaction-id)))

(define-read-only (get-ma-transaction (transaction-id uint))
  (ok (map-get? ma-transactions transaction-id)))
