(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map residency-policies (string-ascii 32) {requires-local-storage: bool, allowed-regions: (string-ascii 256)})

(define-public (set-residency-policy (jurisdiction (string-ascii 32)) (requires-local-storage bool) (allowed-regions (string-ascii 256)))
  (ok (map-set residency-policies jurisdiction {requires-local-storage: requires-local-storage, allowed-regions: allowed-regions})))

(define-read-only (get-residency-policy (jurisdiction (string-ascii 32)))
  (ok (map-get? residency-policies jurisdiction)))
