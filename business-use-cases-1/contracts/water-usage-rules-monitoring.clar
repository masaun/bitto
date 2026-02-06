(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-quota-exceeded (err u103))

(define-map water-quotas principal {
  allocated-amount: uint,
  used-amount: uint,
  period-start: uint,
  period-end: uint,
  region: (string-ascii 50)
})

(define-map usage-records uint {
  farmer: principal,
  amount: uint,
  timestamp: uint,
  source: (string-ascii 50),
  approved: bool
})

(define-data-var usage-nonce uint u0)

(define-public (allocate-water-quota (farmer principal) (amount uint) (start uint) (end uint) (region (string-ascii 50)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set water-quotas farmer {
      allocated-amount: amount,
      used-amount: u0,
      period-start: start,
      period-end: end,
      region: region
    })
    (ok true)))

(define-public (record-water-usage (amount uint) (source (string-ascii 50)))
  (let ((quota (unwrap! (map-get? water-quotas tx-sender) err-not-found))
        (id (+ (var-get usage-nonce) u1))
        (new-used (+ (get used-amount quota) amount)))
    (asserts! (<= new-used (get allocated-amount quota)) err-quota-exceeded)
    (map-set water-quotas tx-sender (merge quota {used-amount: new-used}))
    (map-set usage-records id {
      farmer: tx-sender,
      amount: amount,
      timestamp: block-height,
      source: source,
      approved: true
    })
    (var-set usage-nonce id)
    (ok id)))

(define-public (reset-quota (farmer principal))
  (let ((quota (unwrap! (map-get? water-quotas farmer) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set water-quotas farmer (merge quota {used-amount: u0}))
    (ok true)))

(define-read-only (get-quota (farmer principal))
  (ok (map-get? water-quotas farmer)))

(define-read-only (get-usage-record (id uint))
  (ok (map-get? usage-records id)))
