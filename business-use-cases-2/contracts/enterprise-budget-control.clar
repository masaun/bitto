(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map budgets principal {total: uint, spent: uint, alert-threshold: uint})

(define-public (set-budget (total uint) (alert-threshold uint))
  (begin
    (asserts! (and (> total u0) (<= alert-threshold u100)) ERR-INVALID-PARAMETER)
    (ok (map-set budgets tx-sender {total: total, spent: u0, alert-threshold: alert-threshold}))))

(define-public (record-spend (amount uint))
  (let ((budget (unwrap! (map-get? budgets tx-sender) ERR-NOT-FOUND)))
    (ok (map-set budgets tx-sender (merge budget {spent: (+ (get spent budget) amount)})))))

(define-read-only (get-budget (tenant principal))
  (ok (map-get? budgets tenant)))
