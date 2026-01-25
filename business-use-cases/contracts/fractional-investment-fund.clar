(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-fund-not-found (err u102))
(define-constant err-insufficient-shares (err u103))

(define-map funds uint {
  name: (string-ascii 100),
  total-value: uint,
  total-shares: uint,
  min-investment: uint,
  active: bool
})

(define-map shareholders {fund-id: uint, investor: principal} uint)
(define-data-var fund-nonce uint u0)

(define-read-only (get-fund (fund-id uint))
  (ok (map-get? funds fund-id)))

(define-read-only (get-shares (fund-id uint) (investor principal))
  (ok (default-to u0 (map-get? shareholders {fund-id: fund-id, investor: investor}))))

(define-public (create-fund (name (string-ascii 100)) (min-investment uint))
  (let ((fund-id (+ (var-get fund-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set funds fund-id {
      name: name,
      total-value: u0,
      total-shares: u0,
      min-investment: min-investment,
      active: true
    })
    (var-set fund-nonce fund-id)
    (ok fund-id)))

(define-public (invest (fund-id uint) (amount uint))
  (let ((fund (unwrap! (map-get? funds fund-id) err-fund-not-found)))
    (asserts! (get active fund) err-not-authorized)
    (asserts! (>= amount (get min-investment fund)) err-not-authorized)
    (let (
      (current-shares (default-to u0 (map-get? shareholders {fund-id: fund-id, investor: tx-sender})))
      (new-shares (if (is-eq (get total-shares fund) u0) amount (/ (* amount (get total-shares fund)) (get total-value fund))))
    )
      (map-set shareholders {fund-id: fund-id, investor: tx-sender} (+ current-shares new-shares))
      (ok (map-set funds fund-id {
        name: (get name fund),
        total-value: (+ (get total-value fund) amount),
        total-shares: (+ (get total-shares fund) new-shares),
        min-investment: (get min-investment fund),
        active: (get active fund)
      })))))

(define-public (redeem (fund-id uint) (shares uint))
  (let (
    (fund (unwrap! (map-get? funds fund-id) err-fund-not-found))
    (investor-shares (unwrap! (map-get? shareholders {fund-id: fund-id, investor: tx-sender}) err-not-authorized))
  )
    (asserts! (>= investor-shares shares) err-insufficient-shares)
    (let ((value (/ (* shares (get total-value fund)) (get total-shares fund))))
      (map-set shareholders {fund-id: fund-id, investor: tx-sender} (- investor-shares shares))
      (ok (map-set funds fund-id {
        name: (get name fund),
        total-value: (- (get total-value fund) value),
        total-shares: (- (get total-shares fund) shares),
        min-investment: (get min-investment fund),
        active: (get active fund)
      })))))

(define-public (update-fund-value (fund-id uint) (new-value uint))
  (let ((fund (unwrap! (map-get? funds fund-id) err-fund-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set funds fund-id (merge fund {total-value: new-value})))))
