(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)

(define-map tax-profiles
  principal
  {
    country: (string-ascii 3),
    tax-id: (string-ascii 50),
    withholding-rate: uint,
    treaty-rate: (optional uint),
    active: bool
  }
)

(define-map withholding-records
  { recipient: principal, payment-id: uint }
  {
    gross-amount: uint,
    withheld-amount: uint,
    net-amount: uint,
    tax-rate: uint,
    payment-date: uint,
    remitted: bool
  }
)

(define-map treaty-rates
  { from-country: (string-ascii 3), to-country: (string-ascii 3) }
  uint
)

(define-data-var withholding-nonce uint u0)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-tax-profile (recipient principal))
  (ok (map-get? tax-profiles recipient))
)

(define-read-only (get-withholding-record (recipient principal) (payment-id uint))
  (ok (map-get? withholding-records { recipient: recipient, payment-id: payment-id }))
)

(define-read-only (get-treaty-rate (from-country (string-ascii 3)) (to-country (string-ascii 3)))
  (ok (map-get? treaty-rates { from-country: from-country, to-country: to-country }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-tax-profile
  (country (string-ascii 3))
  (tax-id (string-ascii 50))
  (withholding-rate uint)
)
  (begin
    (ok (map-set tax-profiles tx-sender {
      country: country,
      tax-id: tax-id,
      withholding-rate: withholding-rate,
      treaty-rate: none,
      active: true
    }))
  )
)

(define-public (set-treaty-rate
  (from-country (string-ascii 3))
  (to-country (string-ascii 3))
  (rate uint)
)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set treaty-rates { from-country: from-country, to-country: to-country } rate))
  )
)

(define-public (record-withholding
  (recipient principal)
  (payment-id uint)
  (gross-amount uint)
  (tax-rate uint)
)
  (let 
    (
      (withheld (/ (* gross-amount tax-rate) u10000))
      (net (- gross-amount withheld))
    )
    (ok (map-set withholding-records { recipient: recipient, payment-id: payment-id } {
      gross-amount: gross-amount,
      withheld-amount: withheld,
      net-amount: net,
      tax-rate: tax-rate,
      payment-date: stacks-block-height,
      remitted: false
    }))
  )
)

(define-public (mark-tax-remitted (recipient principal) (payment-id uint))
  (let ((record (unwrap! (map-get? withholding-records { recipient: recipient, payment-id: payment-id }) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set withholding-records { recipient: recipient, payment-id: payment-id }
      (merge record { remitted: true })))
  )
)
