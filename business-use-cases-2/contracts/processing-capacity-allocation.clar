(define-map capacity-allocations uint {
  facility-id: uint,
  allocated-to: principal,
  capacity-amount: uint,
  start-date: uint,
  end-date: uint,
  status: (string-ascii 20)
})

(define-data-var allocation-counter uint u0)

(define-read-only (get-allocation (allocation-id uint))
  (map-get? capacity-allocations allocation-id))

(define-public (allocate-capacity (facility-id uint) (allocated-to principal) (capacity-amount uint) (duration uint))
  (let ((new-id (+ (var-get allocation-counter) u1)))
    (map-set capacity-allocations new-id {
      facility-id: facility-id,
      allocated-to: allocated-to,
      capacity-amount: capacity-amount,
      start-date: stacks-block-height,
      end-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set allocation-counter new-id)
    (ok new-id)))
