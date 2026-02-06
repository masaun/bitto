(define-map facilities uint {
  operator: principal,
  location: (string-utf8 256),
  capacity: uint,
  license-date: uint,
  status: (string-ascii 20)
})

(define-data-var facility-counter uint u0)
(define-data-var facility-authority principal tx-sender)

(define-read-only (get-facility (facility-id uint))
  (map-get? facilities facility-id))

(define-public (register-facility (operator principal) (location (string-utf8 256)) (capacity uint))
  (let ((new-id (+ (var-get facility-counter) u1)))
    (asserts! (is-eq tx-sender (var-get facility-authority)) (err u1))
    (map-set facilities new-id {
      operator: operator,
      location: location,
      capacity: capacity,
      license-date: stacks-block-height,
      status: "operational"
    })
    (var-set facility-counter new-id)
    (ok new-id)))
