(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map drift-metrics {model-id: uint, timestamp: uint} {drift-score: uint, threshold: uint, alert: bool})

(define-public (record-drift (model-id uint) (drift-score uint) (threshold uint))
  (begin
    (asserts! (<= drift-score u100) ERR-INVALID-PARAMETER)
    (ok (map-set drift-metrics {model-id: model-id, timestamp: stacks-block-height} {drift-score: drift-score, threshold: threshold, alert: (> drift-score threshold)}))))

(define-read-only (get-drift (model-id uint) (timestamp uint))
  (ok (map-get? drift-metrics {model-id: model-id, timestamp: timestamp})))
