(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-insufficient-margin (err u103))

(define-map clearing-members principal {
  cash-balance: uint,
  initial-margin: uint,
  maintenance-margin: uint,
  total-positions: uint,
  active: bool
})

(define-map commodity-positions {member: principal, commodity: (string-ascii 50)} {
  long-quantity: uint,
  short-quantity: uint,
  average-price: uint,
  unrealized-pnl: int
})

(define-map cleared-trades uint {
  buyer: principal,
  seller: principal,
  commodity: (string-ascii 50),
  quantity: uint,
  price: uint,
  cleared-at: uint
})

(define-data-var trade-nonce uint u0)

(define-public (register-clearing-member (initial-margin uint))
  (begin
    (map-set clearing-members tx-sender {
      cash-balance: u0,
      initial-margin: initial-margin,
      maintenance-margin: (/ (* initial-margin u75) u100),
      total-positions: u0,
      active: true
    })
    (ok true)))

(define-public (clear-commodity-trade (buyer principal) (seller principal) (commodity (string-ascii 50)) (qty uint) (price uint))
  (let ((buyer-acc (unwrap! (map-get? clearing-members buyer) err-not-found))
        (seller-acc (unwrap! (map-get? clearing-members seller) err-not-found))
        (id (+ (var-get trade-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (>= (get initial-margin buyer-acc) (* qty price)) err-insufficient-margin)
    (map-set cleared-trades id {
      buyer: buyer,
      seller: seller,
      commodity: commodity,
      quantity: qty,
      price: price,
      cleared-at: block-height
    })
    (var-set trade-nonce id)
    (ok id)))

(define-public (update-position (commodity (string-ascii 50)) (long-qty uint) (short-qty uint) (avg-price uint))
  (begin
    (map-set commodity-positions {member: tx-sender, commodity: commodity} {
      long-quantity: long-qty,
      short-quantity: short-qty,
      average-price: avg-price,
      unrealized-pnl: 0
    })
    (ok true)))

(define-read-only (get-member (member principal))
  (ok (map-get? clearing-members member)))

(define-read-only (get-position (member principal) (commodity (string-ascii 50)))
  (ok (map-get? commodity-positions {member: member, commodity: commodity})))

(define-read-only (get-trade (id uint))
  (ok (map-get? cleared-trades id)))
