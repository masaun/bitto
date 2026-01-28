(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map spv-entities uint {
  spv-name: (string-ascii 100),
  manager: principal,
  total-assets: uint,
  total-liabilities: uint,
  carbon-credits: uint,
  status: (string-ascii 20),
  created-at: uint
})

(define-map spv-transactions uint {
  spv-id: uint,
  transaction-type: (string-ascii 50),
  amount: uint,
  counterparty: principal,
  timestamp: uint
})

(define-data-var spv-nonce uint u0)
(define-data-var tx-nonce uint u0)

(define-public (create-spv (name (string-ascii 100)))
  (let ((id (+ (var-get spv-nonce) u1)))
    (map-set spv-entities id {
      spv-name: name,
      manager: tx-sender,
      total-assets: u0,
      total-liabilities: u0,
      carbon-credits: u0,
      status: "active",
      created-at: block-height
    })
    (var-set spv-nonce id)
    (ok id)))

(define-public (record-spv-transaction (spv-id uint) (tx-type (string-ascii 50)) (amount uint) (party principal))
  (let ((spv (unwrap! (map-get? spv-entities spv-id) err-not-found))
        (id (+ (var-get tx-nonce) u1)))
    (asserts! (is-eq tx-sender (get manager spv)) err-unauthorized)
    (map-set spv-transactions id {
      spv-id: spv-id,
      transaction-type: tx-type,
      amount: amount,
      counterparty: party,
      timestamp: block-height
    })
    (var-set tx-nonce id)
    (ok id)))

(define-public (update-spv-balance (spv-id uint) (assets uint) (liabilities uint) (credits uint))
  (let ((spv (unwrap! (map-get? spv-entities spv-id) err-not-found)))
    (asserts! (is-eq tx-sender (get manager spv)) err-unauthorized)
    (map-set spv-entities spv-id (merge spv {
      total-assets: assets,
      total-liabilities: liabilities,
      carbon-credits: credits
    }))
    (ok true)))

(define-read-only (get-spv (id uint))
  (ok (map-get? spv-entities id)))

(define-read-only (get-transaction (id uint))
  (ok (map-get? spv-transactions id)))
