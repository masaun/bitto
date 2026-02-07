(define-map ev-contracts uint {
  supplier: principal,
  ev-manufacturer: principal,
  material-type: (string-ascii 50),
  quantity-per-period: uint,
  price-per-unit: uint,
  start-date: uint,
  end-date: uint,
  status: (string-ascii 20)
})

(define-data-var contract-counter uint u0)

(define-read-only (get-ev-contract (contract-id uint))
  (map-get? ev-contracts contract-id))

(define-public (create-ev-supply-contract (ev-manufacturer principal) (material-type (string-ascii 50)) (quantity-per-period uint) (price-per-unit uint) (duration uint))
  (let ((new-id (+ (var-get contract-counter) u1)))
    (map-set ev-contracts new-id {
      supplier: tx-sender,
      ev-manufacturer: ev-manufacturer,
      material-type: material-type,
      quantity-per-period: quantity-per-period,
      price-per-unit: price-per-unit,
      start-date: stacks-block-height,
      end-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set contract-counter new-id)
    (ok new-id)))
