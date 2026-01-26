(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-zone-not-found (err u102))

(define-map zones uint {
  location: (string-ascii 100),
  performance-standards: (string-ascii 500),
  current-metrics: (string-ascii 500),
  meets-standards: bool,
  last-evaluation: uint
})

(define-map zone-incentives {zone-id: uint, developer: principal} {
  incentive-type: (string-ascii 100),
  amount: uint,
  approved: bool
})

(define-data-var zone-nonce uint u0)

(define-read-only (get-zone (zone-id uint))
  (ok (map-get? zones zone-id)))

(define-read-only (get-incentive (zone-id uint) (developer principal))
  (ok (map-get? zone-incentives {zone-id: zone-id, developer: developer})))

(define-public (create-zone (location (string-ascii 100)) (performance-standards (string-ascii 500)))
  (let ((zone-id (+ (var-get zone-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set zones zone-id {
      location: location,
      performance-standards: performance-standards,
      current-metrics: "",
      meets-standards: false,
      last-evaluation: stacks-stacks-block-height
    })
    (var-set zone-nonce zone-id)
    (ok zone-id)))

(define-public (update-metrics (zone-id uint) (metrics (string-ascii 500)))
  (let ((zone (unwrap! (map-get? zones zone-id) err-zone-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set zones zone-id 
      (merge zone {current-metrics: metrics, last-evaluation: stacks-stacks-block-height})))))

(define-public (evaluate-compliance (zone-id uint) (meets-standards bool))
  (let ((zone (unwrap! (map-get? zones zone-id) err-zone-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set zones zone-id (merge zone {meets-standards: meets-standards})))))

(define-public (request-incentive (zone-id uint) (incentive-type (string-ascii 100)) (amount uint))
  (begin
    (ok (map-set zone-incentives {zone-id: zone-id, developer: tx-sender} {
      incentive-type: incentive-type,
      amount: amount,
      approved: false
    }))))

(define-public (approve-incentive (zone-id uint) (developer principal))
  (let ((incentive (unwrap! (map-get? zone-incentives {zone-id: zone-id, developer: developer}) err-not-authorized)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set zone-incentives {zone-id: zone-id, developer: developer} 
      (merge incentive {approved: true})))))
