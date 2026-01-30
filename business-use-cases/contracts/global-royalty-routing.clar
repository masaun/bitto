(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)

(define-map royalty-routes
  { work-id: uint, territory: (string-ascii 3) }
  {
    recipient: principal,
    currency: (string-ascii 10),
    exchange-rate: uint,
    routing-fee: uint,
    active: bool
  }
)

(define-map cross-border-payments
  { payment-id: uint }
  {
    work-id: uint,
    sender: principal,
    recipient: principal,
    source-amount: uint,
    source-currency: (string-ascii 10),
    target-amount: uint,
    target-currency: (string-ascii 10),
    exchange-rate: uint,
    fees: uint,
    timestamp: uint
  }
)

(define-map exchange-rates
  { from-currency: (string-ascii 10), to-currency: (string-ascii 10) }
  {
    rate: uint,
    last-updated: uint
  }
)

(define-data-var payment-nonce uint u0)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-royalty-route (work-id uint) (territory (string-ascii 3)))
  (ok (map-get? royalty-routes { work-id: work-id, territory: territory }))
)

(define-read-only (get-cross-border-payment (payment-id uint))
  (ok (map-get? cross-border-payments { payment-id: payment-id }))
)

(define-read-only (get-exchange-rate (from-currency (string-ascii 10)) (to-currency (string-ascii 10)))
  (ok (map-get? exchange-rates { from-currency: from-currency, to-currency: to-currency }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (configure-route
  (work-id uint)
  (territory (string-ascii 3))
  (recipient principal)
  (currency (string-ascii 10))
  (routing-fee uint)
)
  (begin
    (ok (map-set royalty-routes { work-id: work-id, territory: territory } {
      recipient: recipient,
      currency: currency,
      exchange-rate: u10000,
      routing-fee: routing-fee,
      active: true
    }))
  )
)

(define-public (update-exchange-rate
  (from-currency (string-ascii 10))
  (to-currency (string-ascii 10))
  (rate uint)
)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set exchange-rates { from-currency: from-currency, to-currency: to-currency } {
      rate: rate,
      last-updated: stacks-block-height
    }))
  )
)

(define-public (process-cross-border-payment
  (work-id uint)
  (recipient principal)
  (source-amount uint)
  (source-currency (string-ascii 10))
  (target-currency (string-ascii 10))
)
  (let 
    (
      (payment-id (+ (var-get payment-nonce) u1))
      (rate-data (unwrap! (map-get? exchange-rates { from-currency: source-currency, to-currency: target-currency }) ERR_NOT_FOUND))
      (target-amount (/ (* source-amount (get rate rate-data)) u10000))
    )
    (map-set cross-border-payments { payment-id: payment-id } {
      work-id: work-id,
      sender: tx-sender,
      recipient: recipient,
      source-amount: source-amount,
      source-currency: source-currency,
      target-amount: target-amount,
      target-currency: target-currency,
      exchange-rate: (get rate rate-data),
      fees: u0,
      timestamp: stacks-block-height
    })
    (var-set payment-nonce payment-id)
    (ok payment-id)
  )
)
