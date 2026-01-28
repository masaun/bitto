(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map transfer-listings
  {listing-id: uint}
  {
    player: principal,
    selling-club: principal,
    asking-price: uint,
    status: (string-ascii 16),
    listed-at: uint
  }
)

(define-map transfer-offers
  {offer-id: uint}
  {
    listing-id: uint,
    buying-club: principal,
    offer-amount: uint,
    status: (string-ascii 16),
    created-at: uint
  }
)

(define-map completed-transfers
  {transfer-id: uint}
  {
    player: principal,
    from-club: principal,
    to-club: principal,
    fee: uint,
    timestamp: uint
  }
)

(define-data-var listing-nonce uint u0)
(define-data-var offer-nonce uint u0)
(define-data-var transfer-nonce uint u0)

(define-read-only (get-listing (listing-id uint))
  (map-get? transfer-listings {listing-id: listing-id})
)

(define-read-only (get-offer (offer-id uint))
  (map-get? transfer-offers {offer-id: offer-id})
)

(define-public (list-player (player principal) (asking-price uint))
  (let ((listing-id (var-get listing-nonce)))
    (asserts! (> asking-price u0) err-invalid-params)
    (map-set transfer-listings {listing-id: listing-id}
      {
        player: player,
        selling-club: tx-sender,
        asking-price: asking-price,
        status: "active",
        listed-at: stacks-block-height
      }
    )
    (var-set listing-nonce (+ listing-id u1))
    (ok listing-id)
  )
)

(define-public (make-offer (listing-id uint) (offer-amount uint))
  (let (
    (listing (unwrap! (map-get? transfer-listings {listing-id: listing-id}) err-not-found))
    (offer-id (var-get offer-nonce))
  )
    (asserts! (is-eq (get status listing) "active") err-invalid-params)
    (asserts! (> offer-amount u0) err-invalid-params)
    (map-set transfer-offers {offer-id: offer-id}
      {
        listing-id: listing-id,
        buying-club: tx-sender,
        offer-amount: offer-amount,
        status: "pending",
        created-at: stacks-block-height
      }
    )
    (var-set offer-nonce (+ offer-id u1))
    (ok offer-id)
  )
)

(define-public (accept-offer (offer-id uint))
  (let (
    (offer (unwrap! (map-get? transfer-offers {offer-id: offer-id}) err-not-found))
    (listing (unwrap! (map-get? transfer-listings {listing-id: (get listing-id offer)}) err-not-found))
    (transfer-id (var-get transfer-nonce))
  )
    (asserts! (is-eq tx-sender (get selling-club listing)) err-unauthorized)
    (map-set completed-transfers {transfer-id: transfer-id}
      {
        player: (get player listing),
        from-club: (get selling-club listing),
        to-club: (get buying-club offer),
        fee: (get offer-amount offer),
        timestamp: stacks-block-height
      }
    )
    (map-set transfer-listings {listing-id: (get listing-id offer)}
      (merge listing {status: "sold"})
    )
    (var-set transfer-nonce (+ transfer-id u1))
    (ok transfer-id)
  )
)
