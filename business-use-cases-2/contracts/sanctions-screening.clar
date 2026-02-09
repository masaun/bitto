(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map sanctions-checks principal {is-sanctioned: bool, jurisdictions: (string-ascii 128), last-check: uint})

(define-public (screen-for-sanctions (entity principal) (jurisdictions (string-ascii 128)))
  (ok (map-set sanctions-checks entity {is-sanctioned: false, jurisdictions: jurisdictions, last-check: stacks-block-height})))

(define-read-only (get-sanctions-status (entity principal))
  (ok (map-get? sanctions-checks entity)))
