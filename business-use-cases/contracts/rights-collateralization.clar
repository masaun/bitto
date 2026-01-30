(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INSUFFICIENT_COLLATERAL (err u102))
(define-constant ERR_LOAN_ACTIVE (err u103))

(define-data-var contract-owner principal tx-sender)
(define-data-var loan-nonce uint u0)

(define-map collateralized-loans
  uint
  {
    borrower: principal,
    lender: principal,
    catalog-id: uint,
    loan-amount: uint,
    collateral-value: uint,
    interest-rate: uint,
    start-block: uint,
    term-blocks: uint,
    repaid: bool,
    defaulted: bool
  }
)

(define-map loan-payments
  { loan-id: uint, payment-id: uint }
  {
    amount: uint,
    payment-date: uint,
    payment-type: (string-ascii 20)
  }
)

(define-map catalog-liens
  uint
  {
    loan-id: uint,
    active: bool
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-loan (loan-id uint))
  (ok (map-get? collateralized-loans loan-id))
)

(define-read-only (get-catalog-lien (catalog-id uint))
  (ok (map-get? catalog-liens catalog-id))
)

(define-read-only (get-loan-nonce)
  (ok (var-get loan-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (create-loan
  (lender principal)
  (catalog-id uint)
  (loan-amount uint)
  (collateral-value uint)
  (interest-rate uint)
  (term-blocks uint)
)
  (let 
    (
      (loan-id (+ (var-get loan-nonce) u1))
      (existing-lien (map-get? catalog-liens catalog-id))
    )
    (asserts! (is-none existing-lien) ERR_LOAN_ACTIVE)
    (asserts! (>= collateral-value loan-amount) ERR_INSUFFICIENT_COLLATERAL)
    (map-set collateralized-loans loan-id {
      borrower: tx-sender,
      lender: lender,
      catalog-id: catalog-id,
      loan-amount: loan-amount,
      collateral-value: collateral-value,
      interest-rate: interest-rate,
      start-block: stacks-block-height,
      term-blocks: term-blocks,
      repaid: false,
      defaulted: false
    })
    (map-set catalog-liens catalog-id {
      loan-id: loan-id,
      active: true
    })
    (var-set loan-nonce loan-id)
    (ok loan-id)
  )
)

(define-public (repay-loan (loan-id uint) (amount uint))
  (let ((loan (unwrap! (map-get? collateralized-loans loan-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get borrower loan)) ERR_UNAUTHORIZED)
    (ok true)
  )
)

(define-public (mark-loan-repaid (loan-id uint))
  (let ((loan (unwrap! (map-get? collateralized-loans loan-id) ERR_NOT_FOUND)))
    (map-set collateralized-loans loan-id (merge loan { repaid: true }))
    (ok (map-set catalog-liens (get catalog-id loan) {
      loan-id: loan-id,
      active: false
    }))
  )
)
