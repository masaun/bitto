(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map prompt-versions {prompt-id: uint, version: uint} {hash: (buff 32), timestamp: uint, active: bool})

(define-public (create-version (prompt-id uint) (version uint) (hash (buff 32)))
  (begin
    (asserts! (> version u0) ERR-INVALID-PARAMETER)
    (ok (map-set prompt-versions {prompt-id: prompt-id, version: version} {hash: hash, timestamp: stacks-block-height, active: true}))))

(define-read-only (get-version (prompt-id uint) (version uint))
  (ok (map-get? prompt-versions {prompt-id: prompt-id, version: version})))
