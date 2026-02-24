(define-data-var route-state uint u0)
(define-data-var payment-total uint u0)
(define-data-var routing-enabled bool true)

(define-public (initialize)
  (ok (begin (var-set route-state u0) (var-set payment-total u0))))

(define-public (enable-routing)
  (ok (begin (var-set routing-enabled true) true)))

(define-public (disable-routing)
  (ok (begin (var-set routing-enabled false) false)))

(define-public (route-payment (amount uint) (destination-index uint))
  (if (var-get routing-enabled)
    (if (> amount u0)
      (ok (begin (var-set payment-total (+ (var-get payment-total) amount)) (var-set route-state destination-index) amount))
      (err u1))
    (err u2)))

(define-public (get-routing-state)
  (ok (var-get route-state)))

(define-public (get-total-routed)
  (ok (var-get payment-total)))

(define-public (is-routing-enabled)
  (ok (var-get routing-enabled)))

(define-public (query-router-status)
  (ok {{state: (var-get route-state), total: (var-get payment-total), enabled: (var-get routing-enabled)}}))