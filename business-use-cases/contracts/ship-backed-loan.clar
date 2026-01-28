(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map ship-collateral uint {
  vessel-imo: (string-ascii 20),
  vessel-value: uint,
  owner: principal,
  encumbered: bool,
  appraisal-date: uint
})

(define-map ship-loans uint {
  borrower: principal,
  lender: principal,
  vessel-id: uint,
  loan-amount: uint,
  interest-rate: uint,
  term: uint,
  issued-at: uint,
  repaid: bool
})

(define-data-var collateral-nonce uint u0)
(define-data-var loan-nonce uint u0)

(define-public (register-ship-collateral (imo (string-ascii 20)) (value uint) (appraisal-date uint))
  (let ((id (+ (var-get collateral-nonce) u1)))
    (map-set ship-collateral id {
      vessel-imo: imo,
      vessel-value: value,
      owner: tx-sender,
      encumbered: false,
      appraisal-date: appraisal-date
    })
    (var-set collateral-nonce id)
    (ok id)))

(define-public (issue-ship-loan (lender principal) (vessel-id uint) (amount uint) (rate uint) (term uint))
  (let ((collateral (unwrap! (map-get? ship-collateral vessel-id) err-not-found))
        (id (+ (var-get loan-nonce) u1)))
    (asserts! (is-eq tx-sender (get owner collateral)) err-unauthorized)
    (asserts! (not (get encumbered collateral)) err-unauthorized)
    (asserts! (>= (get vessel-value collateral) (* amount u120)) err-unauthorized)
    (map-set ship-collateral vessel-id (merge collateral {encumbered: true}))
    (map-set ship-loans id {
      borrower: tx-sender,
      lender: lender,
      vessel-id: vessel-id,
      loan-amount: amount,
      interest-rate: rate,
      term: term,
      issued-at: block-height,
      repaid: false
    })
    (var-set loan-nonce id)
    (ok id)))

(define-public (repay-ship-loan (loan-id uint))
  (let ((loan (unwrap! (map-get? ship-loans loan-id) err-not-found))
        (collateral (unwrap! (map-get? ship-collateral (get vessel-id loan)) err-not-found)))
    (asserts! (is-eq tx-sender (get borrower loan)) err-unauthorized)
    (map-set ship-loans loan-id (merge loan {repaid: true}))
    (map-set ship-collateral (get vessel-id loan) (merge collateral {encumbered: false}))
    (ok true)))

(define-read-only (get-collateral (id uint))
  (ok (map-get? ship-collateral id)))

(define-read-only (get-loan (id uint))
  (ok (map-get? ship-loans id)))
