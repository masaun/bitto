(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-insufficient-budget (err u102))

(define-map budgets
  { project-id: uint }
  {
    total-budget: uint,
    spent: uint,
    last-updated: uint
  }
)

(define-public (set-budget (project-id uint) (total-budget uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set budgets { project-id: project-id }
      {
        total-budget: total-budget,
        spent: u0,
        last-updated: stacks-block-height
      }
    )
    (ok true)
  )
)

(define-public (record-expense (project-id uint) (amount uint))
  (let ((budget (unwrap! (map-get? budgets { project-id: project-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= (+ (get spent budget) amount) (get total-budget budget)) err-insufficient-budget)
    (map-set budgets { project-id: project-id }
      (merge budget { spent: (+ (get spent budget) amount), last-updated: stacks-block-height })
    )
    (ok true)
  )
)

(define-read-only (get-budget (project-id uint))
  (ok (map-get? budgets { project-id: project-id }))
)
