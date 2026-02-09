(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map sustainability-metrics uint {energy-usage: uint, carbon-footprint: uint, efficiency-score: uint})
(define-data-var sustainability-nonce uint u0)

(define-public (record-sustainability-metrics (energy-usage uint) (carbon-footprint uint) (efficiency-score uint))
  (let ((metric-id (+ (var-get sustainability-nonce) u1)))
    (asserts! (<= efficiency-score u100) ERR-INVALID-PARAMETER)
    (map-set sustainability-metrics metric-id {energy-usage: energy-usage, carbon-footprint: carbon-footprint, efficiency-score: efficiency-score})
    (var-set sustainability-nonce metric-id)
    (ok metric-id)))

(define-read-only (get-sustainability-metrics (metric-id uint))
  (ok (map-get? sustainability-metrics metric-id)))
