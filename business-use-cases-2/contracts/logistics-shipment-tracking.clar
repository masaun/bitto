(define-map shipments uint {
  batch-id: (string-ascii 100),
  shipper: principal,
  origin: (string-utf8 256),
  destination: (string-utf8 256),
  departure-date: uint,
  status: (string-ascii 20)
})

(define-data-var shipment-counter uint u0)

(define-read-only (get-shipment (shipment-id uint))
  (map-get? shipments shipment-id))

(define-public (create-shipment (batch-id (string-ascii 100)) (origin (string-utf8 256)) (destination (string-utf8 256)))
  (let ((new-id (+ (var-get shipment-counter) u1)))
    (map-set shipments new-id {
      batch-id: batch-id,
      shipper: tx-sender,
      origin: origin,
      destination: destination,
      departure-date: stacks-block-height,
      status: "in-transit"
    })
    (var-set shipment-counter new-id)
    (ok new-id)))

(define-public (update-shipment-status (shipment-id uint) (status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? shipments shipment-id)) (err u2))
    (let ((shipment (unwrap-panic (map-get? shipments shipment-id))))
      (asserts! (is-eq tx-sender (get shipper shipment)) (err u1))
      (ok (map-set shipments shipment-id (merge shipment { status: status }))))))
