(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map budgets principal {total: uint, used: uint, remaining: uint})

(define-public (set-budget (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-PARAMETER)
    (ok (map-set budgets tx-sender {total: amount, used: u0, remaining: amount}))))

(define-public (consume-budget (amount uint))
  (let ((budget (unwrap! (map-get? budgets tx-sender) ERR-NOT-FOUND)))
    (asserts! (<= amount (get remaining budget)) ERR-INVALID-PARAMETER)
    (ok (map-set budgets tx-sender {total: (get total budget), used: (+ (get used budget) amount), remaining: (- (get remaining budget) amount)}))))

(define-read-only (get-budget (user principal))
  (ok (map-get? budgets user)))
