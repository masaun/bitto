(define-map pilot-plant-results uint {
  operator: principal,
  plant-id: (string-ascii 100),
  test-date: uint,
  efficiency: uint,
  yield: uint,
  findings: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var result-counter uint u0)

(define-read-only (get-pilot-result (result-id uint))
  (map-get? pilot-plant-results result-id))

(define-public (record-pilot-result (plant-id (string-ascii 100)) (efficiency uint) (yield uint) (findings (string-utf8 512)))
  (let ((new-id (+ (var-get result-counter) u1)))
    (asserts! (<= efficiency u100) (err u1))
    (asserts! (<= yield u100) (err u2))
    (map-set pilot-plant-results new-id {
      operator: tx-sender,
      plant-id: plant-id,
      test-date: stacks-block-height,
      efficiency: efficiency,
      yield: yield,
      findings: findings,
      status: "verified"
    })
    (var-set result-counter new-id)
    (ok new-id)))
