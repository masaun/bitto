(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map forward-commodity-contracts uint {
  seller: principal,
  buyer: principal,
  commodity-type: (string-ascii 50),
  quantity: uint,
  price-per-unit: uint,
  delivery-date: uint,
  quality-standard: (string-ascii 100),
  settled: bool,
  created-at: uint
})

(define-map settlements uint {
  contract-id: uint,
  delivered-quantity: uint,
  settlement-amount: uint,
  quality-verified: bool,
  settled-at: uint
})

(define-data-var contract-nonce uint u0)

(define-public (create-commodity-forward (buyer principal) (commodity (string-ascii 50)) (qty uint) (price uint) (delivery uint) (quality (string-ascii 100)))
  (let ((id (+ (var-get contract-nonce) u1)))
    (map-set forward-commodity-contracts id {
      seller: tx-sender,
      buyer: buyer,
      commodity-type: commodity,
      quantity: qty,
      price-per-unit: price,
      delivery-date: delivery,
      quality-standard: quality,
      settled: false,
      created-at: block-height
    })
    (var-set contract-nonce id)
    (ok id)))

(define-public (settle-commodity-contract (contract-id uint) (delivered-qty uint) (quality-ok bool))
  (let ((contract (unwrap! (map-get? forward-commodity-contracts contract-id) err-not-found))
        (settlement-amt (* delivered-qty (get price-per-unit contract))))
    (asserts! (or (is-eq tx-sender (get seller contract))
                  (is-eq tx-sender (get buyer contract))) err-unauthorized)
    (map-set forward-commodity-contracts contract-id (merge contract {settled: true}))
    (map-set settlements contract-id {
      contract-id: contract-id,
      delivered-quantity: delivered-qty,
      settlement-amount: settlement-amt,
      quality-verified: quality-ok,
      settled-at: block-height
    })
    (ok settlement-amt)))

(define-read-only (get-contract (id uint))
  (ok (map-get? forward-commodity-contracts id)))

(define-read-only (get-settlement (id uint))
  (ok (map-get? settlements id)))
