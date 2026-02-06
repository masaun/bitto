(define-map defense-forecasts uint {
  forecast-year: uint,
  material-type: (string-ascii 50),
  estimated-demand: uint,
  confidence-level: uint,
  forecaster: principal,
  timestamp: uint
})

(define-data-var forecast-counter uint u0)

(define-read-only (get-defense-forecast (forecast-id uint))
  (map-get? defense-forecasts forecast-id))

(define-public (submit-defense-forecast (forecast-year uint) (material-type (string-ascii 50)) (estimated-demand uint) (confidence-level uint))
  (let ((new-id (+ (var-get forecast-counter) u1)))
    (asserts! (<= confidence-level u100) (err u1))
    (map-set defense-forecasts new-id {
      forecast-year: forecast-year,
      material-type: material-type,
      estimated-demand: estimated-demand,
      confidence-level: confidence-level,
      forecaster: tx-sender,
      timestamp: stacks-block-height
    })
    (var-set forecast-counter new-id)
    (ok new-id)))
