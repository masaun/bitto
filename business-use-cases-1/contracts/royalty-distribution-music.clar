(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map payment-pool
  { work-id: uint, period: uint }
  {
    total-amount: uint,
    distributed: uint,
    locked: bool
  }
)

(define-map holder-balances
  { holder: principal, work-id: uint, period: uint }
  uint
)

(define-map holder-withdrawals
  { holder: principal, work-id: uint, period: uint }
  uint
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-payment-pool (work-id uint) (period uint))
  (ok (map-get? payment-pool { work-id: work-id, period: period }))
)

(define-read-only (get-holder-balance (holder principal) (work-id uint) (period uint))
  (ok (map-get? holder-balances { holder: holder, work-id: work-id, period: period }))
)

(define-read-only (get-holder-withdrawal (holder principal) (work-id uint) (period uint))
  (ok (map-get? holder-withdrawals { holder: holder, work-id: work-id, period: period }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (fund-pool (work-id uint) (period uint) (amount uint))
  (let 
    (
      (pool (default-to { total-amount: u0, distributed: u0, locked: false } 
        (map-get? payment-pool { work-id: work-id, period: period })))
    )
    (ok (map-set payment-pool { work-id: work-id, period: period } 
      (merge pool { total-amount: (+ (get total-amount pool) amount) })))
  )
)

(define-public (allocate-payment
  (holder principal)
  (work-id uint)
  (period uint)
  (amount uint)
)
  (let 
    (
      (current-balance (default-to u0 (map-get? holder-balances { holder: holder, work-id: work-id, period: period })))
    )
    (ok (map-set holder-balances { holder: holder, work-id: work-id, period: period } 
      (+ current-balance amount)))
  )
)

(define-public (withdraw-royalties (work-id uint) (period uint))
  (let 
    (
      (balance (unwrap! (map-get? holder-balances { holder: tx-sender, work-id: work-id, period: period }) ERR_NOT_FOUND))
      (withdrawn (default-to u0 (map-get? holder-withdrawals { holder: tx-sender, work-id: work-id, period: period })))
      (available (- balance withdrawn))
    )
    (asserts! (> available u0) ERR_INSUFFICIENT_BALANCE)
    (ok (map-set holder-withdrawals { holder: tx-sender, work-id: work-id, period: period } balance))
  )
)
