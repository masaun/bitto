(define-map price-caps uint {max-price: uint, category: (string-ascii 64)})
(define-read-only (get-cap (id uint)) (map-get? price-caps id))
(define-public (set-cap (id uint) (max uint) (cat (string-ascii 64)))
  (begin
    (map-set price-caps id {max-price: max, category: cat})
    (ok true)))
