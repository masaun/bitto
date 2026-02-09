(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map gdpr-compliance principal {consent: bool, data-minimization: bool, right-to-erasure: bool})

(define-public (set-gdpr-compliance (consent bool) (data-minimization bool) (right-to-erasure bool))
  (ok (map-set gdpr-compliance tx-sender {consent: consent, data-minimization: data-minimization, right-to-erasure: right-to-erasure})))

(define-read-only (get-gdpr-compliance (entity principal))
  (ok (map-get? gdpr-compliance entity)))
