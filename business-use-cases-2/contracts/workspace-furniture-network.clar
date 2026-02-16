(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-amount (err u104))

(define-map items uint {name: (string-ascii 100), price: uint, stock: uint, active: bool, producer: principal})
(define-map orders uint {buyer: principal, item-id: uint, quantity: uint, total: uint, fulfilled: bool, created-at: uint})
(define-map suppliers principal {registered: bool, rating: uint, total-sales: uint})
(define-data-var item-nonce uint u0)
(define-data-var order-nonce uint u0)
(define-data-var total-volume uint u0)

(define-read-only (get-item (id uint))
  (ok (map-get? items id))
)

(define-read-only (get-order (id uint))
  (ok (map-get? orders id))
)

(define-read-only (get-supplier (supplier principal))
  (ok (map-get? suppliers supplier))
)

(define-read-only (get-total-volume)
  (ok (var-get total-volume))
)

(define-public (register-supplier)
  (let ((supplier (map-get? suppliers tx-sender)))
    (asserts! (is-none supplier) err-already-exists)
    (ok (map-set suppliers tx-sender {registered: true, rating: u50, total-sales: u0}))
  )
)

(define-public (add-item (name (string-ascii 100)) (price uint) (stock uint))
  (let (
    (item-id (var-get item-nonce))
    (supplier (unwrap! (map-get? suppliers tx-sender) err-not-found))
  )
    (asserts! (get registered supplier) err-unauthorized)
    (asserts! (> price u0) err-invalid-amount)
    (asserts! (> stock u0) err-invalid-amount)
    (ok (begin
      (map-set items item-id {name: name, price: price, stock: stock, active: true, producer: tx-sender})
      (var-set item-nonce (+ item-id u1))
      item-id
    ))
  )
)

(define-public (create-order (item-id uint) (quantity uint))
  (let (
    (item (unwrap! (map-get? items item-id) err-not-found))
    (order-id (var-get order-nonce))
    (total-price (* (get price item) quantity))
  )
    (asserts! (get active item) err-unauthorized)
    (asserts! (>= (get stock item) quantity) err-invalid-amount)
    (asserts! (> quantity u0) err-invalid-amount)
    (ok (begin
      (map-set items item-id (merge item {stock: (- (get stock item) quantity)}))
      (map-set orders order-id {
        buyer: tx-sender,
        item-id: item-id,
        quantity: quantity,
        total: total-price,
        fulfilled: false,
        created-at: burn-block-height
      })
      (var-set order-nonce (+ order-id u1))
      (var-set total-volume (+ (var-get total-volume) total-price))
      order-id
    ))
  )
)

(define-public (fulfill-order (order-id uint))
  (let (
    (order (unwrap! (map-get? orders order-id) err-not-found))
    (item (unwrap! (map-get? items (get item-id order)) err-not-found))
    (supplier (unwrap! (map-get? suppliers (get producer item)) err-not-found))
  )
    (asserts! (is-eq tx-sender (get producer item)) err-unauthorized)
    (asserts! (not (get fulfilled order)) err-already-exists)
    (ok (begin
      (map-set orders order-id (merge order {fulfilled: true}))
      (map-set suppliers (get producer item) 
        (merge supplier {total-sales: (+ (get total-sales supplier) (get total order))}))
      true
    ))
  )
)

(define-public (update-stock (item-id uint) (new-stock uint))
  (let ((item (unwrap! (map-get? items item-id) err-not-found)))
    (asserts! (is-eq tx-sender (get producer item)) err-unauthorized)
    (ok (map-set items item-id (merge item {stock: new-stock})))
  )
)

(define-public (update-price (item-id uint) (new-price uint))
  (let ((item (unwrap! (map-get? items item-id) err-not-found)))
    (asserts! (is-eq tx-sender (get producer item)) err-unauthorized)
    (asserts! (> new-price u0) err-invalid-amount)
    (ok (map-set items item-id (merge item {price: new-price})))
  )
)

(define-public (toggle-item (item-id uint))
  (let ((item (unwrap! (map-get? items item-id) err-not-found)))
    (asserts! (is-eq tx-sender (get producer item)) err-unauthorized)
    (ok (map-set items item-id (merge item {active: (not (get active item))})))
  )
)

(define-public (update-rating (supplier principal) (new-rating uint))
  (let ((supplier-data (unwrap! (map-get? suppliers supplier) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= new-rating u100) err-invalid-amount)
    (ok (map-set suppliers supplier (merge supplier-data {rating: new-rating})))
  )
)
