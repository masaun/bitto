(define-constant contract-owner tx-sender)

(define-map data-listings uint {provider: principal, data-type: (string-ascii 32), price: uint, available: bool})
(define-map data-purchases uint {listing-id: uint, buyer: principal, purchased-at: uint})
(define-data-var listing-nonce uint u0)
(define-data-var purchase-nonce uint u0)

(define-public (create-listing (data-type (string-ascii 32)) (price uint))
  (let ((id (var-get listing-nonce)))
    (map-set data-listings id {provider: tx-sender, data-type: data-type, price: price, available: true})
    (var-set listing-nonce (+ id u1))
    (ok id)))

(define-public (purchase-data (listing-id uint))
  (let ((purchase-id (var-get purchase-nonce)))
    (map-set data-purchases purchase-id {listing-id: listing-id, buyer: tx-sender, purchased-at: stacks-block-height})
    (var-set purchase-nonce (+ purchase-id u1))
    (ok purchase-id)))

(define-read-only (get-listing (listing-id uint))
  (ok (map-get? data-listings listing-id)))
