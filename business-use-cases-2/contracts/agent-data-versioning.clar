(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map data-versions uint {data-id: uint, version: uint, hash: (buff 32), timestamp: uint})
(define-data-var version-nonce uint u0)

(define-public (create-version (data-id uint) (version uint) (hash (buff 32)))
  (let ((ver-id (+ (var-get version-nonce) u1)))
    (asserts! (> version u0) ERR-INVALID-PARAMETER)
    (map-set data-versions ver-id {data-id: data-id, version: version, hash: hash, timestamp: stacks-block-height})
    (var-set version-nonce ver-id)
    (ok ver-id)))

(define-read-only (get-version (ver-id uint))
  (ok (map-get? data-versions ver-id)))
