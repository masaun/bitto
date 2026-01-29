(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map vessel-mortgage-pool uint {
  pool-name: (string-ascii 100),
  total-mortgages: uint,
  total-value: uint,
  manager: principal,
  active: bool,
  created-at: uint
})

(define-map pooled-mortgages uint {
  pool-id: uint,
  vessel-imo: (string-ascii 20),
  mortgage-amount: uint,
  interest-rate: uint,
  borrower: principal,
  added-at: uint
})

(define-map pool-backed-loans uint {
  pool-id: uint,
  lender: principal,
  loan-amount: uint,
  interest-rate: uint,
  term: uint,
  issued-at: uint,
  repaid: bool
})

(define-data-var pool-nonce uint u0)
(define-data-var mortgage-nonce uint u0)
(define-data-var loan-nonce uint u0)

(define-public (create-mortgage-pool (name (string-ascii 100)))
  (let ((id (+ (var-get pool-nonce) u1)))
    (map-set vessel-mortgage-pool id {
      pool-name: name,
      total-mortgages: u0,
      total-value: u0,
      manager: tx-sender,
      active: true,
      created-at: block-height
    })
    (var-set pool-nonce id)
    (ok id)))

(define-public (add-mortgage-to-pool (pool-id uint) (imo (string-ascii 20)) (amount uint) (rate uint))
  (let ((pool (unwrap! (map-get? vessel-mortgage-pool pool-id) err-not-found))
        (id (+ (var-get mortgage-nonce) u1)))
    (asserts! (is-eq tx-sender (get manager pool)) err-unauthorized)
    (map-set pooled-mortgages id {
      pool-id: pool-id,
      vessel-imo: imo,
      mortgage-amount: amount,
      interest-rate: rate,
      borrower: tx-sender,
      added-at: block-height
    })
    (map-set vessel-mortgage-pool pool-id (merge pool {
      total-mortgages: (+ (get total-mortgages pool) u1),
      total-value: (+ (get total-value pool) amount)
    }))
    (var-set mortgage-nonce id)
    (ok id)))

(define-public (issue-pool-backed-loan (pool-id uint) (lender principal) (amount uint) (rate uint) (term uint))
  (let ((pool (unwrap! (map-get? vessel-mortgage-pool pool-id) err-not-found))
        (id (+ (var-get loan-nonce) u1)))
    (asserts! (is-eq tx-sender (get manager pool)) err-unauthorized)
    (map-set pool-backed-loans id {
      pool-id: pool-id,
      lender: lender,
      loan-amount: amount,
      interest-rate: rate,
      term: term,
      issued-at: block-height,
      repaid: false
    })
    (var-set loan-nonce id)
    (ok id)))

(define-read-only (get-pool (id uint))
  (ok (map-get? vessel-mortgage-pool id)))

(define-read-only (get-pooled-mortgage (id uint))
  (ok (map-get? pooled-mortgages id)))

(define-read-only (get-loan (id uint))
  (ok (map-get? pool-backed-loans id)))
