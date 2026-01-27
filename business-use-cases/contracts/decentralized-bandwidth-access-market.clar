(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map bandwidth-providers
  {provider-id: principal}
  {
    total-bandwidth-gb: uint,
    available-bandwidth-gb: uint,
    price-per-gb: uint,
    region: (string-ascii 128),
    active: bool
  }
)

(define-map bandwidth-orders
  {order-id: uint}
  {
    buyer: principal,
    provider: principal,
    bandwidth-gb: uint,
    price: uint,
    duration-blocks: uint,
    start-height: uint,
    end-height: uint,
    status: (string-ascii 16)
  }
)

(define-map usage-records
  {record-id: uint}
  {
    order-id: uint,
    bandwidth-used: uint,
    timestamp: uint
  }
)

(define-data-var order-nonce uint u0)
(define-data-var record-nonce uint u0)

(define-read-only (get-provider (provider-id principal))
  (map-get? bandwidth-providers {provider-id: provider-id})
)

(define-read-only (get-order (order-id uint))
  (map-get? bandwidth-orders {order-id: order-id})
)

(define-read-only (get-usage-record (record-id uint))
  (map-get? usage-records {record-id: record-id})
)

(define-public (register-provider
  (total-bandwidth-gb uint)
  (price-per-gb uint)
  (region (string-ascii 128))
)
  (begin
    (asserts! (> total-bandwidth-gb u0) err-invalid-params)
    (ok (map-set bandwidth-providers {provider-id: tx-sender}
      {
        total-bandwidth-gb: total-bandwidth-gb,
        available-bandwidth-gb: total-bandwidth-gb,
        price-per-gb: price-per-gb,
        region: region,
        active: true
      }
    ))
  )
)

(define-public (purchase-bandwidth
  (provider principal)
  (bandwidth-gb uint)
  (duration-blocks uint)
)
  (let (
    (provider-data (unwrap! (map-get? bandwidth-providers {provider-id: provider}) err-not-found))
    (order-id (var-get order-nonce))
    (total-price (* bandwidth-gb (get price-per-gb provider-data)))
  )
    (asserts! (get active provider-data) err-unauthorized)
    (asserts! (<= bandwidth-gb (get available-bandwidth-gb provider-data)) err-invalid-params)
    (map-set bandwidth-orders {order-id: order-id}
      {
        buyer: tx-sender,
        provider: provider,
        bandwidth-gb: bandwidth-gb,
        price: total-price,
        duration-blocks: duration-blocks,
        start-height: stacks-block-height,
        end-height: (+ stacks-block-height duration-blocks),
        status: "active"
      }
    )
    (map-set bandwidth-providers {provider-id: provider}
      (merge provider-data {
        available-bandwidth-gb: (- (get available-bandwidth-gb provider-data) bandwidth-gb)
      })
    )
    (var-set order-nonce (+ order-id u1))
    (ok order-id)
  )
)

(define-public (record-usage (order-id uint) (bandwidth-used uint))
  (let (
    (order (unwrap! (map-get? bandwidth-orders {order-id: order-id}) err-not-found))
    (record-id (var-get record-nonce))
  )
    (asserts! (is-eq tx-sender (get provider order)) err-unauthorized)
    (asserts! (is-eq (get status order) "active") err-invalid-params)
    (map-set usage-records {record-id: record-id}
      {
        order-id: order-id,
        bandwidth-used: bandwidth-used,
        timestamp: stacks-block-height
      }
    )
    (var-set record-nonce (+ record-id u1))
    (ok record-id)
  )
)

(define-public (complete-order (order-id uint))
  (let ((order (unwrap! (map-get? bandwidth-orders {order-id: order-id}) err-not-found)))
    (asserts! (>= stacks-block-height (get end-height order)) err-invalid-params)
    (ok (map-set bandwidth-orders {order-id: order-id}
      (merge order {status: "completed"})
    ))
  )
)
