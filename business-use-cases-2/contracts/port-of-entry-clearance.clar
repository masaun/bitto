(define-map clearances uint {
  shipment-id: uint,
  port: (string-ascii 100),
  clearance-date: uint,
  customs-officer: principal,
  status: (string-ascii 20)
})

(define-data-var clearance-counter uint u0)
(define-data-var customs-authority principal tx-sender)

(define-read-only (get-clearance (clearance-id uint))
  (map-get? clearances clearance-id))

(define-public (grant-clearance (shipment-id uint) (port (string-ascii 100)))
  (let ((new-id (+ (var-get clearance-counter) u1)))
    (asserts! (is-eq tx-sender (var-get customs-authority)) (err u1))
    (map-set clearances new-id {
      shipment-id: shipment-id,
      port: port,
      clearance-date: stacks-block-height,
      customs-officer: tx-sender,
      status: "cleared"
    })
    (var-set clearance-counter new-id)
    (ok new-id)))
