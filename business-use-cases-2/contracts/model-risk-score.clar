(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map model-risks uint {model-id: uint, risk-score: uint, factors: (string-ascii 256)})

(define-public (assess-model-risk (model-id uint) (risk-score uint) (factors (string-ascii 256)))
  (begin
    (asserts! (<= risk-score u100) ERR-INVALID-PARAMETER)
    (ok (map-set model-risks model-id {model-id: model-id, risk-score: risk-score, factors: factors}))))

(define-read-only (get-model-risk (model-id uint))
  (ok (map-get? model-risks model-id)))
