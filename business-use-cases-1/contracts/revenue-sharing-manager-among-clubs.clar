(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map clubs
  {club-id: uint}
  {
    name: (string-ascii 128),
    league: (string-ascii 64),
    revenue: uint,
    expenses: uint,
    active: bool
  }
)

(define-map revenue-pools
  {pool-id: uint}
  {
    total-revenue: uint,
    num-clubs: uint,
    season: uint,
    distributed: bool
  }
)

(define-map club-shares
  {pool-id: uint, club-id: uint}
  {share-amount: uint, claimed: bool}
)

(define-data-var club-nonce uint u0)
(define-data-var pool-nonce uint u0)

(define-read-only (get-club (club-id uint))
  (map-get? clubs {club-id: club-id})
)

(define-read-only (get-pool (pool-id uint))
  (map-get? revenue-pools {pool-id: pool-id})
)

(define-public (register-club
  (name (string-ascii 128))
  (league (string-ascii 64))
)
  (let ((club-id (var-get club-nonce)))
    (map-set clubs {club-id: club-id}
      {
        name: name,
        league: league,
        revenue: u0,
        expenses: u0,
        active: true
      }
    )
    (var-set club-nonce (+ club-id u1))
    (ok club-id)
  )
)

(define-public (create-revenue-pool (total-revenue uint) (season uint))
  (let ((pool-id (var-get pool-nonce)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> total-revenue u0) err-invalid-params)
    (map-set revenue-pools {pool-id: pool-id}
      {
        total-revenue: total-revenue,
        num-clubs: u0,
        season: season,
        distributed: false
      }
    )
    (var-set pool-nonce (+ pool-id u1))
    (ok pool-id)
  )
)

(define-public (distribute-shares
  (pool-id uint)
  (club-id uint)
  (share-amount uint)
)
  (let ((pool (unwrap! (map-get? revenue-pools {pool-id: pool-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (get distributed pool)) err-invalid-params)
    (ok (map-set club-shares {pool-id: pool-id, club-id: club-id}
      {share-amount: share-amount, claimed: false}
    ))
  )
)

(define-public (claim-share (pool-id uint) (club-id uint))
  (let (
    (club (unwrap! (map-get? clubs {club-id: club-id}) err-not-found))
    (share (unwrap! (map-get? club-shares {pool-id: pool-id, club-id: club-id}) err-not-found))
  )
    (asserts! (not (get claimed share)) err-invalid-params)
    (ok (map-set club-shares {pool-id: pool-id, club-id: club-id}
      (merge share {claimed: true})
    ))
  )
)
