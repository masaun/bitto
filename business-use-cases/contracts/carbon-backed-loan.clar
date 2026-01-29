(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-insufficient-collateral (err u102))

(define-map carbon-collateral principal {
  total-credits: uint,
  locked-credits: uint,
  credit-value: uint
})

(define-map carbon-loans uint {
  borrower: principal,
  loan-amount: uint,
  collateral-credits: uint,
  interest-rate: uint,
  term: uint,
  issued-at: uint,
  repaid: bool
})

(define-data-var loan-nonce uint u0)

(define-public (deposit-carbon-collateral (credits uint) (value uint))
  (let ((current (default-to {total-credits: u0, locked-credits: u0, credit-value: u0}
                             (map-get? carbon-collateral tx-sender))))
    (map-set carbon-collateral tx-sender {
      total-credits: (+ (get total-credits current) credits),
      locked-credits: (get locked-credits current),
      credit-value: value
    })
    (ok true)))

(define-public (borrow-against-carbon (amount uint) (credits uint) (rate uint) (term uint))
  (let ((collateral (unwrap! (map-get? carbon-collateral tx-sender) err-not-found))
        (available (- (get total-credits collateral) (get locked-credits collateral)))
        (id (+ (var-get loan-nonce) u1)))
    (asserts! (>= available credits) err-insufficient-collateral)
    (asserts! (>= (* credits (get credit-value collateral)) (* amount u150)) err-insufficient-collateral)
    (map-set carbon-collateral tx-sender (merge collateral {
      locked-credits: (+ (get locked-credits collateral) credits)
    }))
    (map-set carbon-loans id {
      borrower: tx-sender,
      loan-amount: amount,
      collateral-credits: credits,
      interest-rate: rate,
      term: term,
      issued-at: block-height,
      repaid: false
    })
    (var-set loan-nonce id)
    (ok id)))

(define-public (repay-loan (loan-id uint))
  (let ((loan (unwrap! (map-get? carbon-loans loan-id) err-not-found))
        (collateral (unwrap! (map-get? carbon-collateral (get borrower loan)) err-not-found)))
    (asserts! (is-eq tx-sender (get borrower loan)) err-owner-only)
    (map-set carbon-loans loan-id (merge loan {repaid: true}))
    (map-set carbon-collateral (get borrower loan) (merge collateral {
      locked-credits: (- (get locked-credits collateral) (get collateral-credits loan))
    }))
    (ok true)))

(define-read-only (get-collateral (owner principal))
  (ok (map-get? carbon-collateral owner)))

(define-read-only (get-loan (id uint))
  (ok (map-get? carbon-loans id)))
