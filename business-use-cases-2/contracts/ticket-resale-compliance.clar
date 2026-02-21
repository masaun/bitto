(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-invalid-price (err u102))
(define-constant err-price-violation (err u103))

(define-map resale-listings uint {original-event: uint, seller: principal, price: uint, max-markup: uint, compliant: bool, sold: bool})
(define-map transactions {listing-id: uint, buyer: principal} {price-paid: uint, timestamp: uint})
(define-data-var listing-nonce uint u0)
(define-data-var compliance-fee uint u20)

(define-read-only (get-listing (listing-id uint))
  (map-get? resale-listings listing-id))

(define-read-only (get-transaction (listing-id uint) (buyer principal))
  (map-get? transactions {listing-id: listing-id, buyer: buyer}))

(define-read-only (get-compliance-fee)
  (ok (var-get compliance-fee)))

(define-public (create-listing (original-event uint) (price uint) (max-markup uint))
  (let ((listing-id (+ (var-get listing-nonce) u1)))
    (asserts! (> price u0) err-invalid-price)
    (map-set resale-listings listing-id {original-event: original-event, seller: tx-sender, price: price, max-markup: max-markup, compliant: true, sold: false})
    (var-set listing-nonce listing-id)
    (ok listing-id)))

(define-public (buy-resale-ticket (listing-id uint))
  (let ((listing (unwrap! (map-get? resale-listings listing-id) err-not-found)))
    (asserts! (get compliant listing) err-price-violation)
    (asserts! (not (get sold listing)) err-not-found)
    (try! (stx-transfer? (get price listing) tx-sender (get seller listing)))
    (map-set resale-listings listing-id (merge listing {sold: true}))
    (map-set transactions {listing-id: listing-id, buyer: tx-sender} {price-paid: (get price listing), timestamp: burn-block-height})
    (ok true)))

(define-public (flag-violation (listing-id uint))
  (let ((listing (unwrap! (map-get? resale-listings listing-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set resale-listings listing-id (merge listing {compliant: false}))
    (ok true)))

(define-public (update-compliance-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set compliance-fee new-fee)
    (ok true)))
