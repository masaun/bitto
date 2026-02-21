(define-map price-history {item-id: uint, block: uint} {price: uint, recorded-by: principal})
(define-read-only (get-price-history (item uint) (block uint)) (map-get? price-history {item-id: item, block: block}))
(define-public (record-price (item uint) (price uint))
  (begin
    (map-set price-history {item-id: item, block: stacks-block-height} {price: price, recorded-by: tx-sender})
    (ok true)))
