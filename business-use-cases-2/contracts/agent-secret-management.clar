(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map secrets uint {agent: principal, secret-hash: (buff 32), expiry: uint, rotated: bool})
(define-data-var secret-nonce uint u0)

(define-public (store-secret (secret-hash (buff 32)) (expiry uint))
  (let ((secret-id (+ (var-get secret-nonce) u1)))
    (asserts! (> expiry stacks-block-height) ERR-INVALID-PARAMETER)
    (map-set secrets secret-id {agent: tx-sender, secret-hash: secret-hash, expiry: expiry, rotated: false})
    (var-set secret-nonce secret-id)
    (ok secret-id)))

(define-read-only (get-secret (secret-id uint))
  (ok (map-get? secrets secret-id)))
