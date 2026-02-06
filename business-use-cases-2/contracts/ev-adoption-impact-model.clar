(define-map ev-adoption-models uint {
  region: (string-ascii 50),
  adoption-rate: uint,
  material-demand-impact: uint,
  forecast-year: uint,
  modeler: principal,
  timestamp: uint
})

(define-data-var model-counter uint u0)

(define-read-only (get-adoption-model (model-id uint))
  (map-get? ev-adoption-models model-id))

(define-public (update-adoption-model (region (string-ascii 50)) (adoption-rate uint) (material-demand-impact uint) (forecast-year uint))
  (let ((new-id (+ (var-get model-counter) u1)))
    (asserts! (<= adoption-rate u100) (err u1))
    (map-set ev-adoption-models new-id {
      region: region,
      adoption-rate: adoption-rate,
      material-demand-impact: material-demand-impact,
      forecast-year: forecast-year,
      modeler: tx-sender,
      timestamp: stacks-block-height
    })
    (var-set model-counter new-id)
    (ok new-id)))
