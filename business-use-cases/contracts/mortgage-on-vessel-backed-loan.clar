(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map vessel-mortgages uint {
  vessel-imo: (string-ascii 20),
  mortgagor: principal,
  mortgagee: principal,
  mortgage-amount: uint,
  interest-rate: uint,
  term: uint,
  registered-at: uint,
  discharged: bool
})

(define-map mortgage-loans uint {
  mortgage-id: uint,
  loan-amount: uint,
  disbursed-at: uint,
  maturity-date: uint,
  outstanding-balance: uint
})

(define-data-var mortgage-nonce uint u0)
(define-data-var loan-nonce uint u0)

(define-public (register-vessel-mortgage (imo (string-ascii 20)) (mortgagee principal) (amount uint) (rate uint) (term uint))
  (let ((id (+ (var-get mortgage-nonce) u1)))
    (map-set vessel-mortgages id {
      vessel-imo: imo,
      mortgagor: tx-sender,
      mortgagee: mortgagee,
      mortgage-amount: amount,
      interest-rate: rate,
      term: term,
      registered-at: block-height,
      discharged: false
    })
    (var-set mortgage-nonce id)
    (ok id)))

(define-public (disburse-mortgage-loan (mortgage-id uint) (amount uint) (maturity uint))
  (let ((mortgage (unwrap! (map-get? vessel-mortgages mortgage-id) err-not-found))
        (id (+ (var-get loan-nonce) u1)))
    (asserts! (is-eq tx-sender (get mortgagee mortgage)) err-unauthorized)
    (map-set mortgage-loans id {
      mortgage-id: mortgage-id,
      loan-amount: amount,
      disbursed-at: block-height,
      maturity-date: maturity,
      outstanding-balance: amount
    })
    (var-set loan-nonce id)
    (ok id)))

(define-public (discharge-mortgage (mortgage-id uint))
  (let ((mortgage (unwrap! (map-get? vessel-mortgages mortgage-id) err-not-found)))
    (asserts! (is-eq tx-sender (get mortgagor mortgage)) err-unauthorized)
    (map-set vessel-mortgages mortgage-id (merge mortgage {discharged: true}))
    (ok true)))

(define-read-only (get-mortgage (id uint))
  (ok (map-get? vessel-mortgages id)))

(define-read-only (get-loan (id uint))
  (ok (map-get? mortgage-loans id)))
