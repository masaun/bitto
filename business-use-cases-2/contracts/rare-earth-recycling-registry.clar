(define-map recycling-facilities uint {
  operator: principal,
  location: (string-utf8 256),
  capacity: uint,
  license-date: uint,
  status: (string-ascii 20)
})

(define-data-var facility-counter uint u0)

(define-read-only (get-recycling-facility (facility-id uint))
  (map-get? recycling-facilities facility-id))

(define-public (register-recycling-facility (location (string-utf8 256)) (capacity uint))
  (let ((new-id (+ (var-get facility-counter) u1)))
    (map-set recycling-facilities new-id {
      operator: tx-sender,
      location: location,
      capacity: capacity,
      license-date: stacks-block-height,
      status: "operational"
    })
    (var-set facility-counter new-id)
    (ok new-id)))
