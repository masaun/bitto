(define-map declarations uint {
  shipment-id: uint,
  declarant: principal,
  value: uint,
  declaration-date: uint,
  status: (string-ascii 20)
})

(define-data-var declaration-counter uint u0)

(define-read-only (get-declaration (declaration-id uint))
  (map-get? declarations declaration-id))

(define-public (submit-declaration (shipment-id uint) (value uint))
  (let ((new-id (+ (var-get declaration-counter) u1)))
    (map-set declarations new-id {
      shipment-id: shipment-id,
      declarant: tx-sender,
      value: value,
      declaration-date: stacks-block-height,
      status: "submitted"
    })
    (var-set declaration-counter new-id)
    (ok new-id)))

(define-public (update-declaration-status (declaration-id uint) (status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? declarations declaration-id)) (err u2))
    (ok (map-set declarations declaration-id (merge (unwrap-panic (map-get? declarations declaration-id)) { status: status })))))
