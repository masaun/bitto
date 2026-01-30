(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-insufficient-funds (err u102))

(define-map budgets
  { agency-id: uint, fiscal-year: uint }
  {
    total-budget: uint,
    allocated: uint,
    spent: uint
  }
)

(define-public (set-budget (agency-id uint) (fiscal-year uint) (total-budget uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set budgets { agency-id: agency-id, fiscal-year: fiscal-year }
      {
        total-budget: total-budget,
        allocated: u0,
        spent: u0
      }
    )
    (ok true)
  )
)

(define-public (allocate-budget (agency-id uint) (fiscal-year uint) (amount uint))
  (let ((budget (unwrap! (map-get? budgets { agency-id: agency-id, fiscal-year: fiscal-year }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= (+ (get allocated budget) amount) (get total-budget budget)) err-insufficient-funds)
    (map-set budgets { agency-id: agency-id, fiscal-year: fiscal-year }
      (merge budget { allocated: (+ (get allocated budget) amount) })
    )
    (ok true)
  )
)

(define-public (record-spending (agency-id uint) (fiscal-year uint) (amount uint))
  (let ((budget (unwrap! (map-get? budgets { agency-id: agency-id, fiscal-year: fiscal-year }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= (+ (get spent budget) amount) (get allocated budget)) err-insufficient-funds)
    (map-set budgets { agency-id: agency-id, fiscal-year: fiscal-year }
      (merge budget { spent: (+ (get spent budget) amount) })
    )
    (ok true)
  )
)

(define-read-only (get-budget (agency-id uint) (fiscal-year uint))
  (ok (map-get? budgets { agency-id: agency-id, fiscal-year: fiscal-year }))
)
