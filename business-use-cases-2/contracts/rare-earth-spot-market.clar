(define-map spot-orders uint {
  seller: principal,
  buyer: principal,
  material-type: (string-ascii 50),
  quantity: uint,
  price-per-unit: uint,
  order-date: uint,
  status: (string-ascii 20)
})

(define-data-var order-counter uint u0)

(define-read-only (get-spot-order (order-id uint))
  (map-get? spot-orders order-id))

(define-public (create-spot-order (material-type (string-ascii 50)) (quantity uint) (price-per-unit uint))
  (let ((new-id (+ (var-get order-counter) u1)))
    (map-set spot-orders new-id {
      seller: tx-sender,
      buyer: tx-sender,
      material-type: material-type,
      quantity: quantity,
      price-per-unit: price-per-unit,
      order-date: stacks-block-height,
      status: "open"
    })
    (var-set order-counter new-id)
    (ok new-id)))

(define-public (fill-spot-order (order-id uint))
  (begin
    (asserts! (is-some (map-get? spot-orders order-id)) (err u2))
    (let ((order (unwrap-panic (map-get? spot-orders order-id))))
      (asserts! (is-eq (get status order) "open") (err u1))
      (ok (map-set spot-orders order-id (merge order { buyer: tx-sender, status: "filled" }))))))
