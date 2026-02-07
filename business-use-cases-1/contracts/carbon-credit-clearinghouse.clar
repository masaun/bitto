(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-insufficient-balance (err u103))

(define-map member-accounts principal {
  carbon-balance: uint,
  cash-balance: uint,
  margin-posted: uint,
  active: bool
})

(define-map clearing-transactions uint {
  buyer: principal,
  seller: principal,
  credits: uint,
  price: uint,
  cleared: bool,
  timestamp: uint
})

(define-data-var tx-nonce uint u0)

(define-public (register-member)
  (begin
    (map-set member-accounts tx-sender {
      carbon-balance: u0,
      cash-balance: u0,
      margin-posted: u0,
      active: true
    })
    (ok true)))

(define-public (deposit-margin (amount uint))
  (let ((account (unwrap! (map-get? member-accounts tx-sender) err-not-found)))
    (map-set member-accounts tx-sender (merge account {
      margin-posted: (+ (get margin-posted account) amount)
    }))
    (ok true)))

(define-public (clear-trade (buyer principal) (seller principal) (credits uint) (price uint))
  (let ((buyer-acc (unwrap! (map-get? member-accounts buyer) err-not-found))
        (seller-acc (unwrap! (map-get? member-accounts seller) err-not-found))
        (id (+ (var-get tx-nonce) u1))
        (total-cost (* credits price)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (>= (get cash-balance buyer-acc) total-cost) err-insufficient-balance)
    (asserts! (>= (get carbon-balance seller-acc) credits) err-insufficient-balance)
    (map-set member-accounts buyer (merge buyer-acc {
      carbon-balance: (+ (get carbon-balance buyer-acc) credits),
      cash-balance: (- (get cash-balance buyer-acc) total-cost)
    }))
    (map-set member-accounts seller (merge seller-acc {
      carbon-balance: (- (get carbon-balance seller-acc) credits),
      cash-balance: (+ (get cash-balance seller-acc) total-cost)
    }))
    (map-set clearing-transactions id {
      buyer: buyer,
      seller: seller,
      credits: credits,
      price: price,
      cleared: true,
      timestamp: block-height
    })
    (var-set tx-nonce id)
    (ok id)))

(define-read-only (get-account (member principal))
  (ok (map-get? member-accounts member)))

(define-read-only (get-transaction (id uint))
  (ok (map-get? clearing-transactions id)))
