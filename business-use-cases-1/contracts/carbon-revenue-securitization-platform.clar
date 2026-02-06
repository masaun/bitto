(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map carbon-assets uint {
  asset-name: (string-ascii 100),
  owner: principal,
  projected-revenue: uint,
  actual-revenue: uint,
  securitized-amount: uint,
  active: bool,
  created-at: uint
})

(define-map securities uint {
  asset-id: uint,
  security-type: (string-ascii 50),
  total-value: uint,
  issued-units: uint,
  unit-price: uint,
  maturity-date: uint,
  issued-at: uint
})

(define-data-var asset-nonce uint u0)
(define-data-var security-nonce uint u0)

(define-public (register-carbon-asset (name (string-ascii 100)) (projected-rev uint))
  (let ((id (+ (var-get asset-nonce) u1)))
    (map-set carbon-assets id {
      asset-name: name,
      owner: tx-sender,
      projected-revenue: projected-rev,
      actual-revenue: u0,
      securitized-amount: u0,
      active: true,
      created-at: block-height
    })
    (var-set asset-nonce id)
    (ok id)))

(define-public (issue-security (asset-id uint) (sec-type (string-ascii 50)) (value uint) (units uint) (maturity uint))
  (let ((asset (unwrap! (map-get? carbon-assets asset-id) err-not-found))
        (id (+ (var-get security-nonce) u1))
        (unit-price (/ value units)))
    (asserts! (is-eq tx-sender (get owner asset)) err-unauthorized)
    (map-set securities id {
      asset-id: asset-id,
      security-type: sec-type,
      total-value: value,
      issued-units: units,
      unit-price: unit-price,
      maturity-date: maturity,
      issued-at: block-height
    })
    (map-set carbon-assets asset-id (merge asset {
      securitized-amount: (+ (get securitized-amount asset) value)
    }))
    (var-set security-nonce id)
    (ok id)))

(define-public (update-revenue (asset-id uint) (revenue uint))
  (let ((asset (unwrap! (map-get? carbon-assets asset-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner asset)) err-unauthorized)
    (map-set carbon-assets asset-id (merge asset {actual-revenue: revenue}))
    (ok true)))

(define-read-only (get-asset (id uint))
  (ok (map-get? carbon-assets id)))

(define-read-only (get-security (id uint))
  (ok (map-get? securities id)))
