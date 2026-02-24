(define-data-var proposal-counter uint u0)
(define-data-var vote-total uint u0)
(define-data-var governance-active bool true)

(define-public (initialize)
  (ok (begin (var-set proposal-counter u0) (var-set vote-total u0))))

(define-public (create-proposal)
  (ok (begin (var-set proposal-counter (+ (var-get proposal-counter) u1)) (var-get proposal-counter))))

(define-public (cast-vote (weight uint))
  (if (> weight u0)
    (ok (begin (var-set vote-total (+ (var-get vote-total) weight)) weight))
    (err u1)))

(define-public (get-proposal-count)
  (ok (var-get proposal-counter)))

(define-public (get-total-votes)
  (ok (var-get vote-total)))

(define-public (activate-governance)
  (ok (begin (var-set governance-active true) true)))

(define-public (query-governance-state)
  (ok {proposals: (var-get proposal-counter), votes: (var-get vote-total), active: (var-get governance-active)}))