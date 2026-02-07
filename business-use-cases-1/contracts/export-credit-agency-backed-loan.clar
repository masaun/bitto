(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map eca-guarantees uint {
  borrower: principal,
  eca-agency: principal,
  loan-amount: uint,
  guarantee-percentage: uint,
  vessel-project: (string-ascii 100),
  country: (string-ascii 50),
  status: (string-ascii 20),
  issued-at: uint
})

(define-map eca-backed-loans uint {
  guarantee-id: uint,
  lender: principal,
  borrower: principal,
  loan-amount: uint,
  interest-rate: uint,
  term: uint,
  disbursed-at: uint,
  repaid: bool
})

(define-data-var guarantee-nonce uint u0)
(define-data-var loan-nonce uint u0)

(define-public (issue-eca-guarantee (borrower principal) (amount uint) (guarantee-pct uint) (project (string-ascii 100)) (country (string-ascii 50)))
  (let ((id (+ (var-get guarantee-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set eca-guarantees id {
      borrower: borrower,
      eca-agency: tx-sender,
      loan-amount: amount,
      guarantee-percentage: guarantee-pct,
      vessel-project: project,
      country: country,
      status: "active",
      issued-at: block-height
    })
    (var-set guarantee-nonce id)
    (ok id)))

(define-public (issue-eca-backed-loan (guarantee-id uint) (lender principal) (amount uint) (rate uint) (term uint))
  (let ((guarantee (unwrap! (map-get? eca-guarantees guarantee-id) err-not-found))
        (id (+ (var-get loan-nonce) u1)))
    (asserts! (is-eq tx-sender (get borrower guarantee)) err-unauthorized)
    (map-set eca-backed-loans id {
      guarantee-id: guarantee-id,
      lender: lender,
      borrower: tx-sender,
      loan-amount: amount,
      interest-rate: rate,
      term: term,
      disbursed-at: block-height,
      repaid: false
    })
    (var-set loan-nonce id)
    (ok id)))

(define-public (repay-eca-loan (loan-id uint))
  (let ((loan (unwrap! (map-get? eca-backed-loans loan-id) err-not-found)))
    (asserts! (is-eq tx-sender (get borrower loan)) err-unauthorized)
    (map-set eca-backed-loans loan-id (merge loan {repaid: true}))
    (ok true)))

(define-read-only (get-guarantee (id uint))
  (ok (map-get? eca-guarantees id)))

(define-read-only (get-loan (id uint))
  (ok (map-get? eca-backed-loans id)))
