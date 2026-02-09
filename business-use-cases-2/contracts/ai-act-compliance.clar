(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ai-act-compliance principal {risk-level: uint, transparency: bool, human-oversight: bool})

(define-public (set-ai-act-compliance (risk-level uint) (transparency bool) (human-oversight bool))
  (begin
    (asserts! (<= risk-level u4) ERR-INVALID-PARAMETER)
    (ok (map-set ai-act-compliance tx-sender {risk-level: risk-level, transparency: transparency, human-oversight: human-oversight}))))

(define-read-only (get-ai-act-compliance (entity principal))
  (ok (map-get? ai-act-compliance entity)))
