(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map stadium-tokens
  {stadium-id: uint}
  {
    name: (string-ascii 128),
    location: (string-ascii 128),
    capacity: uint,
    total-shares: uint,
    share-price: uint,
    revenue-pool: uint,
    active: bool
  }
)

(define-map token-holders
  {stadium-id: uint, holder: principal}
  {shares: uint, claimed-revenue: uint}
)

(define-data-var stadium-nonce uint u0)

(define-read-only (get-stadium (stadium-id uint))
  (map-get? stadium-tokens {stadium-id: stadium-id})
)

(define-read-only (get-holder (stadium-id uint) (holder principal))
  (map-get? token-holders {stadium-id: stadium-id, holder: holder})
)

(define-public (tokenize-stadium
  (name (string-ascii 128))
  (location (string-ascii 128))
  (capacity uint)
  (total-shares uint)
  (share-price uint)
)
  (let ((stadium-id (var-get stadium-nonce)))
    (map-set stadium-tokens {stadium-id: stadium-id}
      {
        name: name,
        location: location,
        capacity: capacity,
        total-shares: total-shares,
        share-price: share-price,
        revenue-pool: u0,
        active: true
      }
    )
    (var-set stadium-nonce (+ stadium-id u1))
    (ok stadium-id)
  )
)

(define-public (purchase-shares (stadium-id uint) (shares uint))
  (let ((stadium (unwrap! (map-get? stadium-tokens {stadium-id: stadium-id}) err-not-found)))
    (asserts! (get active stadium) err-invalid-params)
    (match (map-get? token-holders {stadium-id: stadium-id, holder: tx-sender})
      existing-holder
        (map-set token-holders {stadium-id: stadium-id, holder: tx-sender}
          {
            shares: (+ (get shares existing-holder) shares),
            claimed-revenue: (get claimed-revenue existing-holder)
          }
        )
      (map-set token-holders {stadium-id: stadium-id, holder: tx-sender}
        {shares: shares, claimed-revenue: u0}
      )
    )
    (ok true)
  )
)

(define-public (add-revenue (stadium-id uint) (amount uint))
  (let ((stadium (unwrap! (map-get? stadium-tokens {stadium-id: stadium-id}) err-not-found)))
    (map-set stadium-tokens {stadium-id: stadium-id}
      (merge stadium {revenue-pool: (+ (get revenue-pool stadium) amount)})
    )
    (ok true)
  )
)

(define-public (claim-revenue (stadium-id uint))
  (let (
    (stadium (unwrap! (map-get? stadium-tokens {stadium-id: stadium-id}) err-not-found))
    (holder (unwrap! (map-get? token-holders {stadium-id: stadium-id, holder: tx-sender}) err-not-found))
    (claimable (/ (* (get revenue-pool stadium) (get shares holder)) (get total-shares stadium)))
  )
    (map-set token-holders {stadium-id: stadium-id, holder: tx-sender}
      (merge holder {claimed-revenue: (+ (get claimed-revenue holder) claimable)})
    )
    (ok claimable)
  )
)
