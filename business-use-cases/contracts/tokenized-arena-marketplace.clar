(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map arena-listings
  {listing-id: uint}
  {
    seller: principal,
    arena-id: uint,
    shares: uint,
    price-per-share: uint,
    active: bool
  }
)

(define-map arena-shares
  {arena-id: uint, owner: principal}
  {shares: uint}
)

(define-map purchase-offers
  {offer-id: uint}
  {
    listing-id: uint,
    buyer: principal,
    shares: uint,
    total-price: uint,
    accepted: bool
  }
)

(define-data-var listing-nonce uint u0)
(define-data-var offer-nonce uint u0)

(define-read-only (get-listing (listing-id uint))
  (map-get? arena-listings {listing-id: listing-id})
)

(define-read-only (get-shares (arena-id uint) (owner principal))
  (map-get? arena-shares {arena-id: arena-id, owner: owner})
)

(define-read-only (get-offer (offer-id uint))
  (map-get? purchase-offers {offer-id: offer-id})
)

(define-public (list-shares
  (arena-id uint)
  (shares uint)
  (price-per-share uint)
)
  (let (
    (holder (unwrap! (map-get? arena-shares {arena-id: arena-id, owner: tx-sender}) err-not-found))
    (listing-id (var-get listing-nonce))
  )
    (asserts! (>= (get shares holder) shares) err-invalid-params)
    (map-set arena-listings {listing-id: listing-id}
      {
        seller: tx-sender,
        arena-id: arena-id,
        shares: shares,
        price-per-share: price-per-share,
        active: true
      }
    )
    (var-set listing-nonce (+ listing-id u1))
    (ok listing-id)
  )
)

(define-public (make-offer (listing-id uint) (shares uint))
  (let (
    (listing (unwrap! (map-get? arena-listings {listing-id: listing-id}) err-not-found))
    (offer-id (var-get offer-nonce))
  )
    (asserts! (get active listing) err-invalid-params)
    (asserts! (<= shares (get shares listing)) err-invalid-params)
    (map-set purchase-offers {offer-id: offer-id}
      {
        listing-id: listing-id,
        buyer: tx-sender,
        shares: shares,
        total-price: (* shares (get price-per-share listing)),
        accepted: false
      }
    )
    (var-set offer-nonce (+ offer-id u1))
    (ok offer-id)
  )
)

(define-public (accept-offer (offer-id uint))
  (let (
    (offer (unwrap! (map-get? purchase-offers {offer-id: offer-id}) err-not-found))
    (listing (unwrap! (map-get? arena-listings {listing-id: (get listing-id offer)}) err-not-found))
    (seller-shares (unwrap! (map-get? arena-shares {arena-id: (get arena-id listing), owner: tx-sender}) err-not-found))
  )
    (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)
    (asserts! (not (get accepted offer)) err-invalid-params)
    (map-set purchase-offers {offer-id: offer-id}
      (merge offer {accepted: true})
    )
    (map-set arena-shares {arena-id: (get arena-id listing), owner: tx-sender}
      {shares: (- (get shares seller-shares) (get shares offer))}
    )
    (match (map-get? arena-shares {arena-id: (get arena-id listing), owner: (get buyer offer)})
      buyer-shares
        (map-set arena-shares {arena-id: (get arena-id listing), owner: (get buyer offer)}
          {shares: (+ (get shares buyer-shares) (get shares offer))}
        )
      (map-set arena-shares {arena-id: (get arena-id listing), owner: (get buyer offer)}
        {shares: (get shares offer)}
      )
    )
    (ok true)
  )
)
