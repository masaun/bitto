(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-bond-not-found (err u102))
(define-constant err-outcome-not-met (err u103))
(define-constant err-already-redeemed (err u104))

(define-map bonds uint {
  issuer: principal,
  amount: uint,
  target-outcome: uint,
  actual-outcome: uint,
  maturity: uint,
  interest-rate: uint,
  redeemed: bool
})

(define-map investors {bond-id: uint, investor: principal} uint)
(define-data-var bond-nonce uint u0)

(define-read-only (get-bond (bond-id uint))
  (ok (map-get? bonds bond-id)))

(define-read-only (get-investment (bond-id uint) (investor principal))
  (ok (map-get? investors {bond-id: bond-id, investor: investor})))

(define-public (issue-bond (amount uint) (target-outcome uint) (maturity uint) (interest-rate uint))
  (let ((bond-id (+ (var-get bond-nonce) u1)))
    (map-set bonds bond-id {
      issuer: tx-sender,
      amount: amount,
      target-outcome: target-outcome,
      actual-outcome: u0,
      maturity: (+ stacks-block-height maturity),
      interest-rate: interest-rate,
      redeemed: false
    })
    (var-set bond-nonce bond-id)
    (ok bond-id)))

(define-public (invest (bond-id uint) (amount uint))
  (let ((bond (unwrap! (map-get? bonds bond-id) err-bond-not-found)))
    (asserts! (not (get redeemed bond)) err-already-redeemed)
    (let ((current-investment (default-to u0 (map-get? investors {bond-id: bond-id, investor: tx-sender}))))
      (ok (map-set investors {bond-id: bond-id, investor: tx-sender} (+ current-investment amount))))))

(define-public (record-outcome (bond-id uint) (outcome uint))
  (let ((bond (unwrap! (map-get? bonds bond-id) err-bond-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set bonds bond-id (merge bond {actual-outcome: outcome})))))

(define-public (redeem (bond-id uint))
  (let (
    (bond (unwrap! (map-get? bonds bond-id) err-bond-not-found))
    (investment (unwrap! (map-get? investors {bond-id: bond-id, investor: tx-sender}) err-not-authorized))
  )
    (asserts! (>= stacks-block-height (get maturity bond)) err-not-authorized)
    (asserts! (not (get redeemed bond)) err-already-redeemed)
    (asserts! (>= (get actual-outcome bond) (get target-outcome bond)) err-outcome-not-met)
    (let ((payout (+ investment (/ (* investment (get interest-rate bond)) u10000))))
      (ok payout))))
