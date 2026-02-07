(define-map turbine-magnets uint {
  manufacturer: principal,
  turbine-id: (string-ascii 100),
  magnet-batch-id: (string-ascii 100),
  material-source: principal,
  installation-date: uint,
  status: (string-ascii 20)
})

(define-data-var magnet-counter uint u0)

(define-read-only (get-turbine-magnet (magnet-id uint))
  (map-get? turbine-magnets magnet-id))

(define-public (trace-turbine-magnet (turbine-id (string-ascii 100)) (magnet-batch-id (string-ascii 100)) (material-source principal))
  (let ((new-id (+ (var-get magnet-counter) u1)))
    (map-set turbine-magnets new-id {
      manufacturer: tx-sender,
      turbine-id: turbine-id,
      magnet-batch-id: magnet-batch-id,
      material-source: material-source,
      installation-date: stacks-block-height,
      status: "installed"
    })
    (var-set magnet-counter new-id)
    (ok new-id)))
