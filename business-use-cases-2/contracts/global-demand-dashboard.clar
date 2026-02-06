(define-map demand-data uint {
  material-type: (string-ascii 50),
  global-demand: uint,
  forecast-period: uint,
  data-source: principal,
  timestamp: uint
})

(define-data-var data-counter uint u0)

(define-read-only (get-demand-data (data-id uint))
  (map-get? demand-data data-id))

(define-public (update-demand-data (material-type (string-ascii 50)) (global-demand uint) (forecast-period uint))
  (let ((new-id (+ (var-get data-counter) u1)))
    (map-set demand-data new-id {
      material-type: material-type,
      global-demand: global-demand,
      forecast-period: forecast-period,
      data-source: tx-sender,
      timestamp: stacks-block-height
    })
    (var-set data-counter new-id)
    (ok new-id)))
