(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map carbon-performance-loans uint {
  borrower: principal,
  lender: principal,
  vessel-imo: (string-ascii 20),
  loan-amount: uint,
  base-interest-rate: uint,
  carbon-target: uint,
  current-emissions: uint,
  adjusted-rate: uint,
  term: uint,
  issued-at: uint,
  active: bool
})

(define-map performance-updates uint {
  loan-id: uint,
  emissions-recorded: uint,
  timestamp: uint,
  rate-adjustment: int
})

(define-data-var loan-nonce uint u0)
(define-data-var update-nonce uint u0)

(define-public (issue-carbon-performance-loan (lender principal) (imo (string-ascii 20)) (amount uint) (rate uint) (target uint) (term uint))
  (let ((id (+ (var-get loan-nonce) u1)))
    (map-set carbon-performance-loans id {
      borrower: tx-sender,
      lender: lender,
      vessel-imo: imo,
      loan-amount: amount,
      base-interest-rate: rate,
      carbon-target: target,
      current-emissions: u0,
      adjusted-rate: rate,
      term: term,
      issued-at: block-height,
      active: true
    })
    (var-set loan-nonce id)
    (ok id)))

(define-public (update-carbon-performance (loan-id uint) (emissions uint))
  (let ((loan (unwrap! (map-get? carbon-performance-loans loan-id) err-not-found))
        (id (+ (var-get update-nonce) u1))
        (target (get carbon-target loan))
        (base-rate (get base-interest-rate loan))
        (adjustment (if (<= emissions target) -30
                       (if (<= emissions (+ target (/ target u10))) u0 40)))
        (new-rate (if (< adjustment 0)
                     (if (>= base-rate (to-uint (- 0 adjustment)))
                        (- base-rate (to-uint (- 0 adjustment)))
                        u0)
                     (+ base-rate (to-uint adjustment)))))
    (asserts! (is-eq tx-sender (get borrower loan)) err-unauthorized)
    (map-set carbon-performance-loans loan-id (merge loan {
      current-emissions: emissions,
      adjusted-rate: new-rate
    }))
    (map-set performance-updates id {
      loan-id: loan-id,
      emissions-recorded: emissions,
      timestamp: block-height,
      rate-adjustment: adjustment
    })
    (var-set update-nonce id)
    (ok new-rate)))

(define-read-only (get-loan (id uint))
  (ok (map-get? carbon-performance-loans id)))

(define-read-only (get-update (id uint))
  (ok (map-get? performance-updates id)))
