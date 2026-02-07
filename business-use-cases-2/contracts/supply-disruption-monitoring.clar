(define-map disruption-events uint {
  event-type: (string-ascii 50),
  affected-region: (string-ascii 100),
  material-type: (string-ascii 50),
  severity: uint,
  event-date: uint,
  description: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var event-counter uint u0)

(define-read-only (get-disruption-event (event-id uint))
  (map-get? disruption-events event-id))

(define-public (record-disruption (event-type (string-ascii 50)) (affected-region (string-ascii 100)) (material-type (string-ascii 50)) (severity uint) (description (string-utf8 512)))
  (let ((new-id (+ (var-get event-counter) u1)))
    (asserts! (<= severity u10) (err u1))
    (map-set disruption-events new-id {
      event-type: event-type,
      affected-region: affected-region,
      material-type: material-type,
      severity: severity,
      event-date: stacks-block-height,
      description: description,
      status: "monitoring"
    })
    (var-set event-counter new-id)
    (ok new-id)))
