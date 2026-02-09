(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map refunds uint {user: principal, amount: uint, reason: (string-ascii 128), processed: bool})
(define-data-var refund-nonce uint u0)

(define-public (request-refund (amount uint) (reason (string-ascii 128)))
  (let ((refund-id (+ (var-get refund-nonce) u1)))
    (asserts! (> amount u0) ERR-INVALID-PARAMETER)
    (map-set refunds refund-id {user: tx-sender, amount: amount, reason: reason, processed: false})
    (var-set refund-nonce refund-id)
    (ok refund-id)))

(define-read-only (get-refund (refund-id uint))
  (ok (map-get? refunds refund-id)))
