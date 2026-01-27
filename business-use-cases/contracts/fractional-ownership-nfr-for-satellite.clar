(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map satellite-nfrs
  {nfr-id: uint}
  {
    satellite-id: uint,
    total-shares: uint,
    owner: principal,
    price-per-share: uint,
    metadata-uri: (string-ascii 256)
  }
)

(define-map ownership-shares
  {nfr-id: uint, holder: principal}
  {shares: uint, acquired-at: uint}
)

(define-map revenue-pools
  {nfr-id: uint}
  {total-revenue: uint, distributed: uint, last-distribution: uint}
)

(define-data-var nfr-nonce uint u0)

(define-read-only (get-satellite-nfr (nfr-id uint))
  (map-get? satellite-nfrs {nfr-id: nfr-id})
)

(define-read-only (get-ownership (nfr-id uint) (holder principal))
  (map-get? ownership-shares {nfr-id: nfr-id, holder: holder})
)

(define-read-only (get-revenue-pool (nfr-id uint))
  (map-get? revenue-pools {nfr-id: nfr-id})
)

(define-public (create-nfr
  (satellite-id uint)
  (total-shares uint)
  (price-per-share uint)
  (metadata-uri (string-ascii 256))
)
  (let ((nfr-id (var-get nfr-nonce)))
    (asserts! (> total-shares u0) err-invalid-params)
    (map-set satellite-nfrs {nfr-id: nfr-id}
      {
        satellite-id: satellite-id,
        total-shares: total-shares,
        owner: tx-sender,
        price-per-share: price-per-share,
        metadata-uri: metadata-uri
      }
    )
    (map-set ownership-shares {nfr-id: nfr-id, holder: tx-sender}
      {shares: total-shares, acquired-at: stacks-block-height}
    )
    (map-set revenue-pools {nfr-id: nfr-id}
      {total-revenue: u0, distributed: u0, last-distribution: u0}
    )
    (var-set nfr-nonce (+ nfr-id u1))
    (ok nfr-id)
  )
)

(define-public (transfer-shares
  (nfr-id uint)
  (recipient principal)
  (shares uint)
)
  (let (
    (sender-shares (unwrap! (map-get? ownership-shares {nfr-id: nfr-id, holder: tx-sender}) err-not-found))
    (recipient-shares (default-to {shares: u0, acquired-at: u0}
      (map-get? ownership-shares {nfr-id: nfr-id, holder: recipient})))
  )
    (asserts! (>= (get shares sender-shares) shares) err-invalid-params)
    (map-set ownership-shares {nfr-id: nfr-id, holder: tx-sender}
      (merge sender-shares {shares: (- (get shares sender-shares) shares)})
    )
    (ok (map-set ownership-shares {nfr-id: nfr-id, holder: recipient}
      {
        shares: (+ (get shares recipient-shares) shares),
        acquired-at: (if (is-eq (get shares recipient-shares) u0) stacks-block-height (get acquired-at recipient-shares))
      }
    ))
  )
)

(define-public (distribute-revenue (nfr-id uint) (amount uint))
  (let (
    (nfr (unwrap! (map-get? satellite-nfrs {nfr-id: nfr-id}) err-not-found))
    (pool (unwrap! (map-get? revenue-pools {nfr-id: nfr-id}) err-not-found))
  )
    (asserts! (is-eq tx-sender (get owner nfr)) err-unauthorized)
    (ok (map-set revenue-pools {nfr-id: nfr-id}
      (merge pool {
        total-revenue: (+ (get total-revenue pool) amount),
        last-distribution: stacks-block-height
      })
    ))
  )
)
