(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map climate-loans uint {
  borrower: principal,
  principal-amount: uint,
  interest-rate: uint,
  climate-target: uint,
  current-performance: uint,
  adjusted-rate: uint,
  term: uint,
  issued-at: uint,
  active: bool
})

(define-map performance-updates uint {
  loan-id: uint,
  performance-metric: uint,
  timestamp: uint,
  rate-adjustment: int
})

(define-data-var loan-nonce uint u0)
(define-data-var update-nonce uint u0)

(define-public (issue-climate-loan (amount uint) (rate uint) (target uint) (term uint))
  (let ((id (+ (var-get loan-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set climate-loans id {
      borrower: tx-sender,
      principal-amount: amount,
      interest-rate: rate,
      climate-target: target,
      current-performance: u0,
      adjusted-rate: rate,
      term: term,
      issued-at: block-height,
      active: true
    })
    (var-set loan-nonce id)
    (ok id)))

(define-public (update-climate-performance (loan-id uint) (performance uint))
  (let ((loan (unwrap! (map-get? climate-loans loan-id) err-not-found))
        (id (+ (var-get update-nonce) u1))
        (target (get climate-target loan))
        (base-rate (get interest-rate loan))
        (adjustment (if (>= performance target) -50 
                       (if (>= performance (/ (* target u80) u100)) u0 50)))
        (new-rate (if (< adjustment 0)
                     (if (>= base-rate (to-uint (- 0 adjustment)))
                        (- base-rate (to-uint (- 0 adjustment)))
                        u0)
                     (+ base-rate (to-uint adjustment)))))
    (asserts! (is-eq tx-sender (get borrower loan)) err-unauthorized)
    (map-set climate-loans loan-id (merge loan {
      current-performance: performance,
      adjusted-rate: new-rate
    }))
    (map-set performance-updates id {
      loan-id: loan-id,
      performance-metric: performance,
      timestamp: block-height,
      rate-adjustment: adjustment
    })
    (var-set update-nonce id)
    (ok new-rate)))

(define-read-only (get-loan (id uint))
  (ok (map-get? climate-loans id)))

(define-read-only (get-performance-update (id uint))
  (ok (map-get? performance-updates id)))
