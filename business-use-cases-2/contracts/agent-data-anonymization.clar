(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map anonymization-records uint {original-hash: (buff 32), anon-hash: (buff 32), method: (string-ascii 64)})
(define-data-var anon-nonce uint u0)

(define-public (anonymize-data (original-hash (buff 32)) (anon-hash (buff 32)) (method (string-ascii 64)))
  (let ((anon-id (+ (var-get anon-nonce) u1)))
    (map-set anonymization-records anon-id {original-hash: original-hash, anon-hash: anon-hash, method: method})
    (var-set anon-nonce anon-id)
    (ok anon-id)))

(define-read-only (get-anonymization (anon-id uint))
  (ok (map-get? anonymization-records anon-id)))
