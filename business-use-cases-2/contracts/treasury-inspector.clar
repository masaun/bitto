(define-data-var balance uint u0)
(define-data-var transaction-count uint u0)
(define-data-var manager-status bool true)

(define-public (initialize)
  (ok (begin (var-set balance u0) (var-set transaction-count u0))))

(define-public (deposit-funds (amount uint))
  (if (> amount u0)
    (ok (begin (var-set balance (+ (var-get balance) amount)) (var-set transaction-count (+ (var-get transaction-count) u1)) amount))
    (err u1)))

(define-public (withdraw-funds (amount uint))
  (if (and (> amount u0) (>= (var-get balance) amount))
    (ok (begin (var-set balance (- (var-get balance) amount)) (var-set transaction-count (+ (var-get transaction-count) u1)) amount))
    (err u2)))

(define-public (get-balance)
  (ok (var-get balance)))

(define-public (get-transaction-count)
  (ok (var-get transaction-count)))

(define-public (enable-management)
  (ok (begin (var-set manager-status true) true)))

(define-public (query-treasury-state)
  (ok {balance: (var-get balance), transactions: (var-get transaction-count), active: (var-get manager-status)}))