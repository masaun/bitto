(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map buffer-stocks
  {product-type: (string-ascii 64)}
  {
    current-quantity: uint,
    target-quantity: uint,
    min-quantity: uint,
    max-quantity: uint,
    average-price: uint,
    last-updated: uint
  }
)

(define-map procurement-orders
  {order-id: uint}
  {
    product-type: (string-ascii 64),
    quantity: uint,
    price: uint,
    supplier: principal,
    status: (string-ascii 16),
    created-at: uint
  }
)

(define-map release-orders
  {release-id: uint}
  {
    product-type: (string-ascii 64),
    quantity: uint,
    recipient: principal,
    release-price: uint,
    status: (string-ascii 16),
    created-at: uint
  }
)

(define-data-var order-nonce uint u0)
(define-data-var release-nonce uint u0)

(define-read-only (get-buffer-stock (product-type (string-ascii 64)))
  (map-get? buffer-stocks {product-type: product-type})
)

(define-read-only (get-procurement-order (order-id uint))
  (map-get? procurement-orders {order-id: order-id})
)

(define-read-only (get-release-order (release-id uint))
  (map-get? release-orders {release-id: release-id})
)

(define-public (initialize-buffer
  (product-type (string-ascii 64))
  (target-quantity uint)
  (min-quantity uint)
  (max-quantity uint)
)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= min-quantity target-quantity) err-invalid-params)
    (asserts! (<= target-quantity max-quantity) err-invalid-params)
    (ok (map-set buffer-stocks {product-type: product-type}
      {
        current-quantity: u0,
        target-quantity: target-quantity,
        min-quantity: min-quantity,
        max-quantity: max-quantity,
        average-price: u0,
        last-updated: stacks-block-height
      }
    ))
  )
)

(define-public (procure-stock
  (product-type (string-ascii 64))
  (quantity uint)
  (price uint)
  (supplier principal)
)
  (let (
    (buffer (unwrap! (map-get? buffer-stocks {product-type: product-type}) err-not-found))
    (order-id (var-get order-nonce))
  )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= (+ (get current-quantity buffer) quantity) (get max-quantity buffer)) err-invalid-params)
    (map-set procurement-orders {order-id: order-id}
      {
        product-type: product-type,
        quantity: quantity,
        price: price,
        supplier: supplier,
        status: "pending",
        created-at: stacks-block-height
      }
    )
    (var-set order-nonce (+ order-id u1))
    (ok order-id)
  )
)

(define-public (confirm-procurement (order-id uint))
  (let (
    (order (unwrap! (map-get? procurement-orders {order-id: order-id}) err-not-found))
    (buffer (unwrap! (map-get? buffer-stocks {product-type: (get product-type order)}) err-not-found))
  )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set procurement-orders {order-id: order-id}
      (merge order {status: "confirmed"})
    )
    (ok (map-set buffer-stocks {product-type: (get product-type order)}
      (merge buffer {
        current-quantity: (+ (get current-quantity buffer) (get quantity order)),
        last-updated: stacks-block-height
      })
    ))
  )
)

(define-public (release-stock
  (product-type (string-ascii 64))
  (quantity uint)
  (recipient principal)
  (release-price uint)
)
  (let (
    (buffer (unwrap! (map-get? buffer-stocks {product-type: product-type}) err-not-found))
    (release-id (var-get release-nonce))
  )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= quantity (get current-quantity buffer)) err-invalid-params)
    (map-set release-orders {release-id: release-id}
      {
        product-type: product-type,
        quantity: quantity,
        recipient: recipient,
        release-price: release-price,
        status: "pending",
        created-at: stacks-block-height
      }
    )
    (var-set release-nonce (+ release-id u1))
    (ok release-id)
  )
)

(define-public (confirm-release (release-id uint))
  (let (
    (release (unwrap! (map-get? release-orders {release-id: release-id}) err-not-found))
    (buffer (unwrap! (map-get? buffer-stocks {product-type: (get product-type release)}) err-not-found))
  )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set release-orders {release-id: release-id}
      (merge release {status: "confirmed"})
    )
    (ok (map-set buffer-stocks {product-type: (get product-type release)}
      (merge buffer {
        current-quantity: (- (get current-quantity buffer) (get quantity release)),
        last-updated: stacks-block-height
      })
    ))
  )
)
