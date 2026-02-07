(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map forward-contracts uint {
  seller: principal,
  buyer: principal,
  carbon-credits: uint,
  price-per-credit: uint,
  delivery-date: uint,
  settled: bool,
  created-at: uint
})

(define-map contract-settlements uint {
  contract-id: uint,
  delivered-credits: uint,
  settlement-price: uint,
  settled-at: uint
})

(define-data-var contract-nonce uint u0)

(define-public (create-forward-contract (buyer principal) (credits uint) (price uint) (delivery uint))
  (let ((id (+ (var-get contract-nonce) u1)))
    (map-set forward-contracts id {
      seller: tx-sender,
      buyer: buyer,
      carbon-credits: credits,
      price-per-credit: price,
      delivery-date: delivery,
      settled: false,
      created-at: block-height
    })
    (var-set contract-nonce id)
    (ok id)))

(define-public (settle-contract (contract-id uint) (delivered uint))
  (let ((contract (unwrap! (map-get? forward-contracts contract-id) err-not-found)))
    (asserts! (or (is-eq tx-sender (get seller contract))
                  (is-eq tx-sender (get buyer contract))) err-unauthorized)
    (asserts! (>= block-height (get delivery-date contract)) err-unauthorized)
    (map-set forward-contracts contract-id (merge contract {settled: true}))
    (map-set contract-settlements contract-id {
      contract-id: contract-id,
      delivered-credits: delivered,
      settlement-price: (* delivered (get price-per-credit contract)),
      settled-at: block-height
    })
    (ok true)))

(define-read-only (get-contract (id uint))
  (ok (map-get? forward-contracts id)))

(define-read-only (get-settlement (id uint))
  (ok (map-get? contract-settlements id)))
