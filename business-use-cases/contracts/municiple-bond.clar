(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-bond-not-found (err u102))

(define-map bonds uint {
  municipality: principal,
  amount: uint,
  interest-rate: uint,
  maturity: uint,
  purpose: (string-ascii 200),
  total-issued: uint,
  total-redeemed: uint
})

(define-map bondholders {bond-id: uint, holder: principal} uint)

(define-data-var bond-nonce uint u0)

(define-read-only (get-bond (bond-id uint))
  (ok (map-get? bonds bond-id)))

(define-read-only (get-holdings (bond-id uint) (holder principal))
  (ok (default-to u0 (map-get? bondholders {bond-id: bond-id, holder: holder}))))

(define-public (issue-bond (amount uint) (interest-rate uint) (maturity uint) (purpose (string-ascii 200)))
  (let ((bond-id (+ (var-get bond-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set bonds bond-id {
      municipality: tx-sender,
      amount: amount,
      interest-rate: interest-rate,
      maturity: (+ stacks-stacks-block-height maturity),
      purpose: purpose,
      total-issued: u0,
      total-redeemed: u0
    })
    (var-set bond-nonce bond-id)
    (ok bond-id)))

(define-public (purchase-bond (bond-id uint) (amount uint))
  (let ((bond (unwrap! (map-get? bonds bond-id) err-bond-not-found)))
    (let ((current-holdings (default-to u0 (map-get? bondholders {bond-id: bond-id, holder: tx-sender}))))
      (map-set bondholders {bond-id: bond-id, holder: tx-sender} (+ current-holdings amount))
      (ok (map-set bonds bond-id 
        (merge bond {total-issued: (+ (get total-issued bond) amount)}))))))

(define-public (redeem-bond (bond-id uint) (amount uint))
  (let (
    (bond (unwrap! (map-get? bonds bond-id) err-bond-not-found))
    (holdings (unwrap! (map-get? bondholders {bond-id: bond-id, holder: tx-sender}) err-not-authorized))
  )
    (asserts! (>= stacks-stacks-block-height (get maturity bond)) err-not-authorized)
    (asserts! (>= holdings amount) err-not-authorized)
    (map-set bondholders {bond-id: bond-id, holder: tx-sender} (- holdings amount))
    (let ((payout (+ amount (/ (* amount (get interest-rate bond)) u10000))))
      (ok (map-set bonds bond-id 
        (merge bond {total-redeemed: (+ (get total-redeemed bond) amount)}))))))
