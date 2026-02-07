(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))
(define-constant err-insufficient-stock (err u103))

(define-map inventory
  { chemical-id: (string-ascii 50) }
  {
    chemical-name: (string-ascii 100),
    current-stock: uint,
    unit: (string-ascii 20),
    minimum-stock: uint,
    maximum-stock: uint,
    location: (string-ascii 100),
    last-updated: uint,
    updated-by: principal
  }
)

(define-public (add-to-inventory (chemical-id (string-ascii 50)) (chemical-name (string-ascii 100)) (quantity uint) (unit (string-ascii 20)) (minimum-stock uint) (maximum-stock uint) (location (string-ascii 100)))
  (begin
    (asserts! (is-none (map-get? inventory { chemical-id: chemical-id })) err-already-exists)
    (ok (map-set inventory
      { chemical-id: chemical-id }
      {
        chemical-name: chemical-name,
        current-stock: quantity,
        unit: unit,
        minimum-stock: minimum-stock,
        maximum-stock: maximum-stock,
        location: location,
        last-updated: stacks-block-height,
        updated-by: tx-sender
      }
    ))
  )
)

(define-public (update-stock (chemical-id (string-ascii 50)) (new-stock uint))
  (let ((item (unwrap! (map-get? inventory { chemical-id: chemical-id }) err-not-found)))
    (ok (map-set inventory
      { chemical-id: chemical-id }
      (merge item { 
        current-stock: new-stock,
        last-updated: stacks-block-height,
        updated-by: tx-sender
      })
    ))
  )
)

(define-public (consume-stock (chemical-id (string-ascii 50)) (quantity uint))
  (let ((item (unwrap! (map-get? inventory { chemical-id: chemical-id }) err-not-found)))
    (asserts! (>= (get current-stock item) quantity) err-insufficient-stock)
    (ok (map-set inventory
      { chemical-id: chemical-id }
      (merge item { 
        current-stock: (- (get current-stock item) quantity),
        last-updated: stacks-block-height,
        updated-by: tx-sender
      })
    ))
  )
)

(define-read-only (get-inventory (chemical-id (string-ascii 50)))
  (map-get? inventory { chemical-id: chemical-id })
)
