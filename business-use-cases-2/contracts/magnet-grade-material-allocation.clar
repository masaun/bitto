(define-map allocations uint {
  manufacturer: principal,
  material-type: (string-ascii 50),
  grade: (string-ascii 20),
  quantity: uint,
  allocation-date: uint,
  status: (string-ascii 20)
})

(define-data-var allocation-counter uint u0)

(define-read-only (get-allocation (allocation-id uint))
  (map-get? allocations allocation-id))

(define-public (allocate-material (material-type (string-ascii 50)) (grade (string-ascii 20)) (quantity uint))
  (let ((new-id (+ (var-get allocation-counter) u1)))
    (map-set allocations new-id {
      manufacturer: tx-sender,
      material-type: material-type,
      grade: grade,
      quantity: quantity,
      allocation-date: stacks-block-height,
      status: "allocated"
    })
    (var-set allocation-counter new-id)
    (ok new-id)))
