(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map knowledge-versions {kb-id: uint, version: uint} {hash: (buff 32), timestamp: uint, active: bool})

(define-public (create-knowledge-version (kb-id uint) (version uint) (hash (buff 32)))
  (begin
    (asserts! (> version u0) ERR-INVALID-PARAMETER)
    (ok (map-set knowledge-versions {kb-id: kb-id, version: version} {hash: hash, timestamp: stacks-block-height, active: true}))))

(define-read-only (get-knowledge-version (kb-id uint) (version uint))
  (ok (map-get? knowledge-versions {kb-id: kb-id, version: version})))
