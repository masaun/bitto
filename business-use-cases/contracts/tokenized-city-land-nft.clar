(define-non-fungible-token city-land uint)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-nft-not-found (err u102))

(define-map land-metadata uint {
  location: (string-ascii 100),
  size: uint,
  zoning: (string-ascii 50),
  valuation: uint,
  last-sale-price: uint
})

(define-map land-history {nft-id: uint, event-id: uint} {
  event-type: (string-ascii 50),
  timestamp: uint,
  details: (string-ascii 200)
})

(define-data-var nft-nonce uint u0)

(define-read-only (get-last-token-id)
  (ok (var-get nft-nonce)))

(define-read-only (get-token-uri (nft-id uint))
  (ok (some (get location (unwrap! (map-get? land-metadata nft-id) err-nft-not-found)))))

(define-read-only (get-owner (nft-id uint))
  (ok (nft-get-owner? city-land nft-id)))

(define-read-only (get-land-metadata (nft-id uint))
  (ok (map-get? land-metadata nft-id)))

(define-read-only (get-land-history (nft-id uint) (event-id uint))
  (ok (map-get? land-history {nft-id: nft-id, event-id: event-id})))

(define-public (register-land (location (string-ascii 100)) (size uint) (zoning (string-ascii 50)) (valuation uint))
  (let ((nft-id (+ (var-get nft-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (nft-mint? city-land nft-id tx-sender))
    (map-set land-metadata nft-id {
      location: location,
      size: size,
      zoning: zoning,
      valuation: valuation,
      last-sale-price: u0
    })
    (var-set nft-nonce nft-id)
    (ok nft-id)))

(define-public (transfer (nft-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (try! (nft-transfer? city-land nft-id sender recipient))
    (ok true)))

(define-public (update-valuation (nft-id uint) (valuation uint))
  (let ((metadata (unwrap! (map-get? land-metadata nft-id) err-nft-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set land-metadata nft-id (merge metadata {valuation: valuation})))))

(define-public (record-sale (nft-id uint) (sale-price uint))
  (let ((metadata (unwrap! (map-get? land-metadata nft-id) err-nft-not-found)))
    (ok (map-set land-metadata nft-id (merge metadata {last-sale-price: sale-price})))))

(define-public (add-history-event (nft-id uint) (event-id uint) (event-type (string-ascii 50)) (details (string-ascii 200)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set land-history {nft-id: nft-id, event-id: event-id} {
      event-type: event-type,
      timestamp: stacks-block-height,
      details: details
    }))))
