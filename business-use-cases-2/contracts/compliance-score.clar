(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map compliance-scores principal {overall: uint, gdpr: uint, ai-act: uint, soc2: uint})

(define-public (set-scores (overall uint) (gdpr uint) (ai-act uint) (soc2 uint))
  (begin
    (asserts! (and (<= overall u100) (<= gdpr u100) (<= ai-act u100) (<= soc2 u100)) ERR-INVALID-PARAMETER)
    (ok (map-set compliance-scores tx-sender {overall: overall, gdpr: gdpr, ai-act: ai-act, soc2: soc2}))))

(define-read-only (get-scores (entity principal))
  (ok (map-get? compliance-scores entity)))
