(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map jurisdiction-mapping (string-ascii 32) {region: (string-ascii 64), ai-regulation-tier: uint})

(define-public (set-jurisdiction (code (string-ascii 32)) (region (string-ascii 64)) (ai-regulation-tier uint))
  (begin
    (asserts! (<= ai-regulation-tier u5) ERR-INVALID-PARAMETER)
    (ok (map-set jurisdiction-mapping code {region: region, ai-regulation-tier: ai-regulation-tier}))))

(define-read-only (get-jurisdiction (code (string-ascii 32)))
  (ok (map-get? jurisdiction-mapping code)))
