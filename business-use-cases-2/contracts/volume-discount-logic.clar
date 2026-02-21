(define-map discounts uint {threshold: uint, discount-percent: uint})
(define-read-only (get-discount (id uint)) (map-get? discounts id))
(define-public (set-discount (id uint) (thresh uint) (percent uint))
  (begin
    (map-set discounts id {threshold: thresh, discount-percent: percent})
    (ok true)))
