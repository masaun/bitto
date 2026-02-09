(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map encrypted-memories uint {agent: principal, cipher-hash: (buff 32), key-hash: (buff 32), encrypted: bool})
(define-data-var memory-nonce uint u0)

(define-public (store-encrypted (cipher-hash (buff 32)) (key-hash (buff 32)))
  (let ((mem-id (+ (var-get memory-nonce) u1)))
    (map-set encrypted-memories mem-id {agent: tx-sender, cipher-hash: cipher-hash, key-hash: key-hash, encrypted: true})
    (var-set memory-nonce mem-id)
    (ok mem-id)))

(define-read-only (get-encrypted-memory (mem-id uint))
  (ok (map-get? encrypted-memories mem-id)))
