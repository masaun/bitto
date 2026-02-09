(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map derivative-works uint {original-id: uint, derivative-hash: (buff 32), creator: principal, timestamp: uint})
(define-data-var derivative-nonce uint u0)

(define-public (track-derivative (original-id uint) (derivative-hash (buff 32)))
  (let ((deriv-id (+ (var-get derivative-nonce) u1)))
    (map-set derivative-works deriv-id {original-id: original-id, derivative-hash: derivative-hash, creator: tx-sender, timestamp: stacks-block-height})
    (var-set derivative-nonce deriv-id)
    (ok deriv-id)))

(define-read-only (get-derivative (deriv-id uint))
  (ok (map-get? derivative-works deriv-id)))
