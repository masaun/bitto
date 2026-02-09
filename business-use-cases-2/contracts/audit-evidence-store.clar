(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map audit-evidence uint {evidence-type: (string-ascii 64), hash: (buff 32), timestamp: uint, verified: bool})
(define-data-var evidence-nonce uint u0)

(define-public (store-evidence (evidence-type (string-ascii 64)) (hash (buff 32)))
  (let ((evidence-id (+ (var-get evidence-nonce) u1)))
    (map-set audit-evidence evidence-id {evidence-type: evidence-type, hash: hash, timestamp: stacks-block-height, verified: false})
    (var-set evidence-nonce evidence-id)
    (ok evidence-id)))

(define-read-only (get-evidence (evidence-id uint))
  (ok (map-get? audit-evidence evidence-id)))
