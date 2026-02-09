(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map compliance-records principal {gdpr: bool, ai-act: bool, soc2: bool, iso: bool})

(define-public (set-compliance (gdpr bool) (ai-act bool) (soc2 bool) (iso bool))
  (ok (map-set compliance-records tx-sender {gdpr: gdpr, ai-act: ai-act, soc2: soc2, iso: iso})))

(define-read-only (get-compliance (entity principal))
  (ok (map-get? compliance-records entity)))
