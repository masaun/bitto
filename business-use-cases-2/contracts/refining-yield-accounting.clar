(define-map refining-records uint {
  batch-id: (string-ascii 100),
  input-weight: uint,
  output-weight: uint,
  yield-percentage: uint,
  refiner: principal,
  timestamp: uint
})

(define-data-var record-counter uint u0)

(define-read-only (get-refining-record (record-id uint))
  (map-get? refining-records record-id))

(define-public (record-yield (batch-id (string-ascii 100)) (input-weight uint) (output-weight uint))
  (let (
    (new-id (+ (var-get record-counter) u1))
    (yield-pct (/ (* output-weight u100) input-weight))
  )
    (map-set refining-records new-id {
      batch-id: batch-id,
      input-weight: input-weight,
      output-weight: output-weight,
      yield-percentage: yield-pct,
      refiner: tx-sender,
      timestamp: stacks-block-height
    })
    (var-set record-counter new-id)
    (ok new-id)))
