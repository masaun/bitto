(define-map price-volatility uint {
  material-type: (string-ascii 50),
  volatility-index: uint,
  time-period: uint,
  analyst: principal,
  timestamp: uint
})

(define-data-var volatility-counter uint u0)

(define-read-only (get-price-volatility (volatility-id uint))
  (map-get? price-volatility volatility-id))

(define-public (analyze-price-volatility (material-type (string-ascii 50)) (volatility-index uint) (time-period uint))
  (let ((new-id (+ (var-get volatility-counter) u1)))
    (asserts! (<= volatility-index u100) (err u1))
    (map-set price-volatility new-id {
      material-type: material-type,
      volatility-index: volatility-index,
      time-period: time-period,
      analyst: tx-sender,
      timestamp: stacks-block-height
    })
    (var-set volatility-counter new-id)
    (ok new-id)))
