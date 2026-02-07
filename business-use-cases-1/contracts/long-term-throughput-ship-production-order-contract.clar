(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map throughput-contracts uint {
  shipyard: principal,
  customer: principal,
  minimum-annual-ships: uint,
  contract-duration: uint,
  price-per-ship: uint,
  discount-percentage: uint,
  start-date: uint,
  end-date: uint,
  active: bool
})

(define-map production-deliveries uint {
  contract-id: uint,
  year: uint,
  ships-delivered: uint,
  total-value: uint,
  recorded-at: uint
})

(define-data-var contract-nonce uint u0)
(define-data-var delivery-nonce uint u0)

(define-public (create-throughput-contract (customer principal) (min-ships uint) (duration uint) (price uint) (discount uint))
  (let ((id (+ (var-get contract-nonce) u1)))
    (map-set throughput-contracts id {
      shipyard: tx-sender,
      customer: customer,
      minimum-annual-ships: min-ships,
      contract-duration: duration,
      price-per-ship: price,
      discount-percentage: discount,
      start-date: block-height,
      end-date: (+ block-height duration),
      active: true
    })
    (var-set contract-nonce id)
    (ok id)))

(define-public (record-annual-delivery (contract-id uint) (year uint) (ships uint))
  (let ((contract (unwrap! (map-get? throughput-contracts contract-id) err-not-found))
        (id (+ (var-get delivery-nonce) u1))
        (base-value (* ships (get price-per-ship contract)))
        (discount (/ (* base-value (get discount-percentage contract)) u100))
        (total (- base-value discount)))
    (asserts! (is-eq tx-sender (get shipyard contract)) err-unauthorized)
    (map-set production-deliveries id {
      contract-id: contract-id,
      year: year,
      ships-delivered: ships,
      total-value: total,
      recorded-at: block-height
    })
    (var-set delivery-nonce id)
    (ok id)))

(define-public (terminate-contract (contract-id uint))
  (let ((contract (unwrap! (map-get? throughput-contracts contract-id) err-not-found)))
    (asserts! (or (is-eq tx-sender (get shipyard contract))
                  (is-eq tx-sender (get customer contract))) err-unauthorized)
    (map-set throughput-contracts contract-id (merge contract {active: false}))
    (ok true)))

(define-read-only (get-contract (id uint))
  (ok (map-get? throughput-contracts id)))

(define-read-only (get-delivery (id uint))
  (ok (map-get? production-deliveries id)))
