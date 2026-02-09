(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map iso-governance principal {iso-27001: bool, iso-42001: bool, certified: bool})

(define-public (set-iso-governance (iso-27001 bool) (iso-42001 bool) (certified bool))
  (ok (map-set iso-governance tx-sender {iso-27001: iso-27001, iso-42001: iso-42001, certified: certified})))

(define-read-only (get-iso-governance (entity principal))
  (ok (map-get? iso-governance entity)))
