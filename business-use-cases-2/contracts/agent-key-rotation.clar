(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map key-rotations uint {agent: principal, old-key-hash: (buff 32), new-key-hash: (buff 32), timestamp: uint})
(define-data-var rotation-nonce uint u0)

(define-public (rotate-key (old-key-hash (buff 32)) (new-key-hash (buff 32)))
  (let ((rotation-id (+ (var-get rotation-nonce) u1)))
    (map-set key-rotations rotation-id {agent: tx-sender, old-key-hash: old-key-hash, new-key-hash: new-key-hash, timestamp: stacks-block-height})
    (var-set rotation-nonce rotation-id)
    (ok rotation-id)))

(define-read-only (get-rotation (rotation-id uint))
  (ok (map-get? key-rotations rotation-id)))
