(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-insufficient-balance (err u103))

(define-map bonds uint {issuer: principal, amount: uint, maturity: uint, interest-rate: uint, redeemed: bool})
(define-map bond-holders {bond-id: uint, holder: principal} {shares: uint})
(define-data-var bond-nonce uint u0)
(define-data-var total-bonds uint u0)

(define-read-only (get-bond (bond-id uint))
  (ok (map-get? bonds bond-id))
)

(define-read-only (get-bond-holder (bond-id uint) (holder principal))
  (ok (map-get? bond-holders {bond-id: bond-id, holder: holder}))
)

(define-read-only (get-total-bonds)
  (ok (var-get total-bonds))
)

(define-public (issue-bond (amount uint) (maturity uint) (interest-rate uint))
  (let ((bond-id (var-get bond-nonce)))
    (ok (begin
      (map-set bonds bond-id {issuer: tx-sender, amount: amount, maturity: maturity, interest-rate: interest-rate, redeemed: false})
      (var-set bond-nonce (+ bond-id u1))
      (var-set total-bonds (+ (var-get total-bonds) u1))
      bond-id
    ))
  )
)

(define-public (purchase-bond (bond-id uint) (shares uint))
  (let ((bond (unwrap! (map-get? bonds bond-id) err-not-found)))
    (ok (map-set bond-holders {bond-id: bond-id, holder: tx-sender} {shares: shares}))
  )
)

(define-public (redeem-bond (bond-id uint))
  (let ((bond (unwrap! (map-get? bonds bond-id) err-not-found)))
    (asserts! (is-eq tx-sender (get issuer bond)) err-owner-only)
    (asserts! (not (get redeemed bond)) err-already-exists)
    (ok (map-set bonds bond-id (merge bond {redeemed: true})))
  )
)
