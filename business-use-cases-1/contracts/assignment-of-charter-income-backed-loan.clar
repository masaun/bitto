(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map charter-assignments uint {
  vessel-imo: (string-ascii 20),
  assignor: principal,
  assignee: principal,
  charter-income: uint,
  assignment-percentage: uint,
  start-date: uint,
  end-date: uint,
  active: bool
})

(define-map charter-backed-loans uint {
  assignment-id: uint,
  borrower: principal,
  lender: principal,
  loan-amount: uint,
  interest-rate: uint,
  term: uint,
  issued-at: uint,
  repaid: bool
})

(define-data-var assignment-nonce uint u0)
(define-data-var loan-nonce uint u0)

(define-public (assign-charter-income (imo (string-ascii 20)) (assignee principal) (income uint) (percentage uint) (end-date uint))
  (let ((id (+ (var-get assignment-nonce) u1)))
    (map-set charter-assignments id {
      vessel-imo: imo,
      assignor: tx-sender,
      assignee: assignee,
      charter-income: income,
      assignment-percentage: percentage,
      start-date: block-height,
      end-date: end-date,
      active: true
    })
    (var-set assignment-nonce id)
    (ok id)))

(define-public (issue-charter-backed-loan (assignment-id uint) (lender principal) (amount uint) (rate uint) (term uint))
  (let ((assignment (unwrap! (map-get? charter-assignments assignment-id) err-not-found))
        (id (+ (var-get loan-nonce) u1)))
    (asserts! (is-eq tx-sender (get assignor assignment)) err-unauthorized)
    (map-set charter-backed-loans id {
      assignment-id: assignment-id,
      borrower: tx-sender,
      lender: lender,
      loan-amount: amount,
      interest-rate: rate,
      term: term,
      issued-at: block-height,
      repaid: false
    })
    (var-set loan-nonce id)
    (ok id)))

(define-public (repay-charter-loan (loan-id uint))
  (let ((loan (unwrap! (map-get? charter-backed-loans loan-id) err-not-found)))
    (asserts! (is-eq tx-sender (get borrower loan)) err-unauthorized)
    (map-set charter-backed-loans loan-id (merge loan {repaid: true}))
    (ok true)))

(define-read-only (get-assignment (id uint))
  (ok (map-get? charter-assignments id)))

(define-read-only (get-loan (id uint))
  (ok (map-get? charter-backed-loans id)))
