(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-contract-not-found (err u102))
(define-constant err-outcome-not-met (err u103))

(define-map vendor-contracts uint {
  vendor: principal,
  service: (string-ascii 100),
  base-payment: uint,
  target-outcome: uint,
  actual-outcome: uint,
  bonus-rate: uint,
  completed: bool,
  paid: uint
})

(define-data-var contract-nonce uint u0)

(define-read-only (get-contract (contract-id uint))
  (ok (map-get? vendor-contracts contract-id)))

(define-public (create-contract (vendor principal) (service (string-ascii 100)) (base-payment uint) (target-outcome uint) (bonus-rate uint))
  (let ((contract-id (+ (var-get contract-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set vendor-contracts contract-id {
      vendor: vendor,
      service: service,
      base-payment: base-payment,
      target-outcome: target-outcome,
      actual-outcome: u0,
      bonus-rate: bonus-rate,
      completed: false,
      paid: u0
    })
    (var-set contract-nonce contract-id)
    (ok contract-id)))

(define-public (report-outcome (contract-id uint) (outcome uint))
  (let ((contract (unwrap! (map-get? vendor-contracts contract-id) err-contract-not-found)))
    (asserts! (is-eq tx-sender (get vendor contract)) err-not-authorized)
    (ok (map-set vendor-contracts contract-id 
      (merge contract {actual-outcome: outcome, completed: true})))))

(define-public (process-payment (contract-id uint))
  (let ((contract (unwrap! (map-get? vendor-contracts contract-id) err-contract-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (get completed contract) err-not-authorized)
    (let (
      (performance-ratio (/ (* (get actual-outcome contract) u10000) (get target-outcome contract)))
      (bonus (if (>= performance-ratio u10000)
                (/ (* (get base-payment contract) (get bonus-rate contract)) u10000)
                u0))
      (total-payment (+ (get base-payment contract) bonus))
    )
      (ok (map-set vendor-contracts contract-id 
        (merge contract {paid: total-payment}))))))
