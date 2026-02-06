(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map presale-contracts uint {
  seller: principal,
  buyer: principal,
  credits-committed: uint,
  price-per-credit: uint,
  delivery-year: uint,
  prepayment-percentage: uint,
  delivered: bool,
  created-at: uint
})

(define-map delivery-records uint {
  presale-id: uint,
  delivered-credits: uint,
  delivery-date: uint,
  verification-hash: (string-ascii 64)
})

(define-data-var presale-nonce uint u0)

(define-public (create-presale (buyer principal) (credits uint) (price uint) (delivery-year uint) (prepayment-pct uint))
  (let ((id (+ (var-get presale-nonce) u1)))
    (map-set presale-contracts id {
      seller: tx-sender,
      buyer: buyer,
      credits-committed: credits,
      price-per-credit: price,
      delivery-year: delivery-year,
      prepayment-percentage: prepayment-pct,
      delivered: false,
      created-at: block-height
    })
    (var-set presale-nonce id)
    (ok id)))

(define-public (deliver-carbon-credits (presale-id uint) (credits uint) (verification (string-ascii 64)))
  (let ((presale (unwrap! (map-get? presale-contracts presale-id) err-not-found)))
    (asserts! (is-eq tx-sender (get seller presale)) err-unauthorized)
    (asserts! (>= credits (get credits-committed presale)) err-unauthorized)
    (map-set presale-contracts presale-id (merge presale {delivered: true}))
    (map-set delivery-records presale-id {
      presale-id: presale-id,
      delivered-credits: credits,
      delivery-date: block-height,
      verification-hash: verification
    })
    (ok true)))

(define-read-only (get-presale (id uint))
  (ok (map-get? presale-contracts id)))

(define-read-only (get-delivery (id uint))
  (ok (map-get? delivery-records id)))
