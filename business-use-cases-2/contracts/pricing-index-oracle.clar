(define-map price-indices uint {
  material-type: (string-ascii 50),
  price: uint,
  timestamp: uint,
  source: principal
})

(define-data-var index-counter uint u0)
(define-data-var oracle-authority principal tx-sender)

(define-read-only (get-price-index (index-id uint))
  (map-get? price-indices index-id))

(define-read-only (get-latest-price (material-type (string-ascii 50)))
  (map-get? price-indices (var-get index-counter)))

(define-public (update-price (material-type (string-ascii 50)) (price uint))
  (let ((new-id (+ (var-get index-counter) u1)))
    (asserts! (is-eq tx-sender (var-get oracle-authority)) (err u1))
    (map-set price-indices new-id {
      material-type: material-type,
      price: price,
      timestamp: stacks-block-height,
      source: tx-sender
    })
    (var-set index-counter new-id)
    (ok new-id)))
