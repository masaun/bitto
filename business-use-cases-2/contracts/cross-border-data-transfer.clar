(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map cross-border-transfers uint {origin: (string-ascii 32), destination: (string-ascii 32), data-hash: (buff 32), approved: bool})
(define-data-var transfer-nonce uint u0)

(define-public (register-cross-border-transfer (origin (string-ascii 32)) (destination (string-ascii 32)) (data-hash (buff 32)))
  (let ((transfer-id (+ (var-get transfer-nonce) u1)))
    (map-set cross-border-transfers transfer-id {origin: origin, destination: destination, data-hash: data-hash, approved: false})
    (var-set transfer-nonce transfer-id)
    (ok transfer-id)))

(define-read-only (get-cross-border-transfer (transfer-id uint))
  (ok (map-get? cross-border-transfers transfer-id)))
