(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-insufficient-stock (err u102))

(define-map inventory
  { part-id: uint }
  {
    name: (string-ascii 100),
    quantity: uint,
    location: (string-ascii 100),
    last-updated: uint
  }
)

(define-public (add-inventory (part-id uint) (name (string-ascii 100)) (quantity uint) (location (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set inventory { part-id: part-id }
      {
        name: name,
        quantity: quantity,
        location: location,
        last-updated: stacks-block-height
      }
    )
    (ok true)
  )
)

(define-public (update-quantity (part-id uint) (new-quantity uint))
  (let ((item (unwrap! (map-get? inventory { part-id: part-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set inventory { part-id: part-id }
      (merge item { quantity: new-quantity, last-updated: stacks-block-height })
    )
    (ok true)
  )
)

(define-public (consume-inventory (part-id uint) (amount uint))
  (let ((item (unwrap! (map-get? inventory { part-id: part-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (>= (get quantity item) amount) err-insufficient-stock)
    (map-set inventory { part-id: part-id }
      (merge item { quantity: (- (get quantity item) amount), last-updated: stacks-block-height })
    )
    (ok true)
  )
)

(define-read-only (get-inventory (part-id uint))
  (ok (map-get? inventory { part-id: part-id }))
)
