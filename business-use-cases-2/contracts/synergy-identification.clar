(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map synergies uint {transaction-id: uint, synergy-type: (string-ascii 64), value-estimate: uint})
(define-data-var synergy-nonce uint u0)

(define-public (identify-synergy (transaction-id uint) (synergy-type (string-ascii 64)) (value-estimate uint))
  (let ((synergy-id (+ (var-get synergy-nonce) u1)))
    (map-set synergies synergy-id {transaction-id: transaction-id, synergy-type: synergy-type, value-estimate: value-estimate})
    (var-set synergy-nonce synergy-id)
    (ok synergy-id)))

(define-read-only (get-synergy (synergy-id uint))
  (ok (map-get? synergies synergy-id)))
