(define-map offtake-agreements uint {
  seller: principal,
  buyer: principal,
  material-type: (string-ascii 50),
  quantity-per-period: uint,
  price-per-unit: uint,
  start-date: uint,
  end-date: uint,
  status: (string-ascii 20)
})

(define-data-var agreement-counter uint u0)

(define-read-only (get-offtake-agreement (agreement-id uint))
  (map-get? offtake-agreements agreement-id))

(define-public (create-offtake-agreement (buyer principal) (material-type (string-ascii 50)) (quantity-per-period uint) (price-per-unit uint) (duration uint))
  (let ((new-id (+ (var-get agreement-counter) u1)))
    (map-set offtake-agreements new-id {
      seller: tx-sender,
      buyer: buyer,
      material-type: material-type,
      quantity-per-period: quantity-per-period,
      price-per-unit: price-per-unit,
      start-date: stacks-block-height,
      end-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set agreement-counter new-id)
    (ok new-id)))
