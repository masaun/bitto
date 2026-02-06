(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-insufficient-score (err u103))

(define-map credit-applications uint {
  farmer: principal,
  farm-id: uint,
  requested-amount: uint,
  credit-score: uint,
  collateral-value: uint,
  status: (string-ascii 20),
  applied-at: uint
})

(define-map issued-credits uint {
  application-id: uint,
  amount: uint,
  interest-rate: uint,
  term: uint,
  issued-at: uint,
  repaid: bool
})

(define-data-var application-nonce uint u0)
(define-data-var credit-nonce uint u0)

(define-public (apply-for-credit (farm-id uint) (amount uint) (score uint) (collateral uint))
  (let ((id (+ (var-get application-nonce) u1)))
    (map-set credit-applications id {
      farmer: tx-sender,
      farm-id: farm-id,
      requested-amount: amount,
      credit-score: score,
      collateral-value: collateral,
      status: "pending",
      applied-at: block-height
    })
    (var-set application-nonce id)
    (ok id)))

(define-public (approve-credit (app-id uint) (rate uint) (term uint))
  (let ((app (unwrap! (map-get? credit-applications app-id) err-not-found))
        (credit-id (+ (var-get credit-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (>= (get credit-score app) u600) err-insufficient-score)
    (map-set credit-applications app-id (merge app {status: "approved"}))
    (map-set issued-credits credit-id {
      application-id: app-id,
      amount: (get requested-amount app),
      interest-rate: rate,
      term: term,
      issued-at: block-height,
      repaid: false
    })
    (var-set credit-nonce credit-id)
    (ok credit-id)))

(define-public (mark-repaid (credit-id uint))
  (let ((credit (unwrap! (map-get? issued-credits credit-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set issued-credits credit-id (merge credit {repaid: true}))
    (ok true)))

(define-read-only (get-application (id uint))
  (ok (map-get? credit-applications id)))

(define-read-only (get-credit (id uint))
  (ok (map-get? issued-credits id)))
