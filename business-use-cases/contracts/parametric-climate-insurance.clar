(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map insurance-policies uint {
  policyholder: principal,
  coverage-amount: uint,
  premium: uint,
  trigger-parameter: (string-ascii 50),
  trigger-threshold: uint,
  payout-percentage: uint,
  start-block: uint,
  end-block: uint,
  active: bool
})

(define-map climate-events uint {
  policy-id: uint,
  parameter-value: uint,
  triggered: bool,
  payout-amount: uint,
  recorded-at: uint
})

(define-data-var policy-nonce uint u0)
(define-data-var event-nonce uint u0)

(define-public (create-policy (coverage uint) (premium uint) (param (string-ascii 50)) (threshold uint) (payout-pct uint) (duration uint))
  (let ((id (+ (var-get policy-nonce) u1)))
    (map-set insurance-policies id {
      policyholder: tx-sender,
      coverage-amount: coverage,
      premium: premium,
      trigger-parameter: param,
      trigger-threshold: threshold,
      payout-percentage: payout-pct,
      start-block: block-height,
      end-block: (+ block-height duration),
      active: true
    })
    (var-set policy-nonce id)
    (ok id)))

(define-public (record-climate-event (policy-id uint) (param-value uint))
  (let ((policy (unwrap! (map-get? insurance-policies policy-id) err-not-found))
        (id (+ (var-get event-nonce) u1))
        (is-triggered (>= param-value (get trigger-threshold policy)))
        (payout (if is-triggered
                   (/ (* (get coverage-amount policy) (get payout-percentage policy)) u100)
                   u0)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set climate-events id {
      policy-id: policy-id,
      parameter-value: param-value,
      triggered: is-triggered,
      payout-amount: payout,
      recorded-at: block-height
    })
    (var-set event-nonce id)
    (ok payout)))

(define-public (deactivate-policy (policy-id uint))
  (let ((policy (unwrap! (map-get? insurance-policies policy-id) err-not-found)))
    (asserts! (is-eq tx-sender (get policyholder policy)) err-unauthorized)
    (map-set insurance-policies policy-id (merge policy {active: false}))
    (ok true)))

(define-read-only (get-policy (id uint))
  (ok (map-get? insurance-policies id)))

(define-read-only (get-event (id uint))
  (ok (map-get? climate-events id)))
