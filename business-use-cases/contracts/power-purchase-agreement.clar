(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map ppa-agreements uint {
  seller: principal,
  buyer: principal,
  capacity-mw: uint,
  price-per-mwh: uint,
  contract-term: uint,
  start-date: uint,
  end-date: uint,
  energy-type: (string-ascii 50),
  active: bool
})

(define-map energy-deliveries uint {
  ppa-id: uint,
  period: (string-ascii 50),
  delivered-mwh: uint,
  payment-amount: uint,
  delivered-at: uint
})

(define-data-var ppa-nonce uint u0)
(define-data-var delivery-nonce uint u0)

(define-public (create-ppa (buyer principal) (capacity uint) (price uint) (term uint) (energy-type (string-ascii 50)))
  (let ((id (+ (var-get ppa-nonce) u1)))
    (map-set ppa-agreements id {
      seller: tx-sender,
      buyer: buyer,
      capacity-mw: capacity,
      price-per-mwh: price,
      contract-term: term,
      start-date: block-height,
      end-date: (+ block-height term),
      energy-type: energy-type,
      active: true
    })
    (var-set ppa-nonce id)
    (ok id)))

(define-public (record-delivery (ppa-id uint) (period (string-ascii 50)) (mwh uint))
  (let ((ppa (unwrap! (map-get? ppa-agreements ppa-id) err-not-found))
        (id (+ (var-get delivery-nonce) u1))
        (payment (* mwh (get price-per-mwh ppa))))
    (asserts! (is-eq tx-sender (get seller ppa)) err-unauthorized)
    (map-set energy-deliveries id {
      ppa-id: ppa-id,
      period: period,
      delivered-mwh: mwh,
      payment-amount: payment,
      delivered-at: block-height
    })
    (var-set delivery-nonce id)
    (ok payment)))

(define-public (terminate-ppa (ppa-id uint))
  (let ((ppa (unwrap! (map-get? ppa-agreements ppa-id) err-not-found)))
    (asserts! (or (is-eq tx-sender (get seller ppa))
                  (is-eq tx-sender (get buyer ppa))) err-unauthorized)
    (map-set ppa-agreements ppa-id (merge ppa {active: false}))
    (ok true)))

(define-read-only (get-ppa (id uint))
  (ok (map-get? ppa-agreements id)))

(define-read-only (get-delivery (id uint))
  (ok (map-get? energy-deliveries id)))
