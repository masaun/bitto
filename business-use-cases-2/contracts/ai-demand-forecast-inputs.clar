(define-map forecast-inputs uint {
  contributor: principal,
  data-type: (string-ascii 50),
  value: uint,
  timestamp: uint,
  weight: uint
})

(define-data-var input-counter uint u0)

(define-read-only (get-forecast-input (input-id uint))
  (map-get? forecast-inputs input-id))

(define-public (submit-forecast-input (data-type (string-ascii 50)) (value uint) (weight uint))
  (let ((new-id (+ (var-get input-counter) u1)))
    (asserts! (<= weight u100) (err u1))
    (map-set forecast-inputs new-id {
      contributor: tx-sender,
      data-type: data-type,
      value: value,
      timestamp: stacks-block-height,
      weight: weight
    })
    (var-set input-counter new-id)
    (ok new-id)))
