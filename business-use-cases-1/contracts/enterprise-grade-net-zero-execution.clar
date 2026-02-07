(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map net-zero-plans uint {
  company: principal,
  target-year: uint,
  baseline-emissions: uint,
  current-emissions: uint,
  reduction-target: uint,
  offset-target: uint,
  status: (string-ascii 20),
  created-at: uint
})

(define-map emission-reductions uint {
  plan-id: uint,
  period: (string-ascii 50),
  emissions-reduced: uint,
  method: (string-ascii 100),
  verified: bool,
  timestamp: uint
})

(define-data-var plan-nonce uint u0)
(define-data-var reduction-nonce uint u0)

(define-public (create-net-zero-plan (target-year uint) (baseline uint) (reduction uint) (offset uint))
  (let ((id (+ (var-get plan-nonce) u1)))
    (map-set net-zero-plans id {
      company: tx-sender,
      target-year: target-year,
      baseline-emissions: baseline,
      current-emissions: baseline,
      reduction-target: reduction,
      offset-target: offset,
      status: "active",
      created-at: block-height
    })
    (var-set plan-nonce id)
    (ok id)))

(define-public (record-emission-reduction (plan-id uint) (period (string-ascii 50)) (reduced uint) (method (string-ascii 100)))
  (let ((plan (unwrap! (map-get? net-zero-plans plan-id) err-not-found))
        (id (+ (var-get reduction-nonce) u1))
        (new-emissions (if (>= (get current-emissions plan) reduced)
                          (- (get current-emissions plan) reduced)
                          u0)))
    (asserts! (is-eq tx-sender (get company plan)) err-unauthorized)
    (map-set emission-reductions id {
      plan-id: plan-id,
      period: period,
      emissions-reduced: reduced,
      method: method,
      verified: false,
      timestamp: block-height
    })
    (map-set net-zero-plans plan-id (merge plan {current-emissions: new-emissions}))
    (var-set reduction-nonce id)
    (ok id)))

(define-public (verify-reduction (reduction-id uint))
  (let ((reduction (unwrap! (map-get? emission-reductions reduction-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set emission-reductions reduction-id (merge reduction {verified: true}))
    (ok true)))

(define-read-only (get-plan (id uint))
  (ok (map-get? net-zero-plans id)))

(define-read-only (get-reduction (id uint))
  (ok (map-get? emission-reductions id)))
