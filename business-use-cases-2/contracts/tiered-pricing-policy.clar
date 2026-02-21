(define-map tiers uint {min-quantity: uint, max-quantity: uint, price: uint})
(define-read-only (get-tier (id uint)) (map-get? tiers id))
(define-public (add-tier (id uint) (min uint) (max uint) (price uint))
  (begin
    (map-set tiers id {min-quantity: min, max-quantity: max, price: price})
    (ok true)))
