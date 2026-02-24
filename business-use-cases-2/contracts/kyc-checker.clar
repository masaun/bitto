(define-data-var compliance-score uint u0)
(define-data-var check-counter uint u0)
(define-data-var compliance-mode bool true)

(define-public (initialize)
  (ok (begin (var-set compliance-score u100) (var-set check-counter u0))))

(define-public (perform-check (check-type uint))
  (if (var-get compliance-mode)
    (ok (begin (var-set check-counter (+ (var-get check-counter) u1)) check-type))
    (err u1)))

(define-public (update-score (new-score uint))
  (if (and (>= new-score u0) (<= new-score u100))
    (ok (begin (var-set compliance-score new-score) new-score))
    (err u2)))

(define-public (get-compliance-score)
  (ok (var-get compliance-score)))

(define-public (get-check-count)
  (ok (var-get check-counter)))

(define-public (enable-compliance)
  (ok (begin (var-set compliance-mode true) true)))

(define-public (query-compliance-status)
  (ok {score: (var-get compliance-score), checks: (var-get check-counter), active: (var-get compliance-mode)}))