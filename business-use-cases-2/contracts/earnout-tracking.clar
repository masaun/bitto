(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map earnouts uint {transaction-id: uint, milestone: (string-ascii 128), value: uint, achieved: bool})
(define-data-var earnout-nonce uint u0)

(define-public (create-earnout (transaction-id uint) (milestone (string-ascii 128)) (value uint))
  (let ((earnout-id (+ (var-get earnout-nonce) u1)))
    (map-set earnouts earnout-id {transaction-id: transaction-id, milestone: milestone, value: value, achieved: false})
    (var-set earnout-nonce earnout-id)
    (ok earnout-id)))

(define-read-only (get-earnout (earnout-id uint))
  (ok (map-get? earnouts earnout-id)))
