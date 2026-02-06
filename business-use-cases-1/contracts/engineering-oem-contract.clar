(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map oem-contracts uint {
  oem: principal,
  shipbuilder: principal,
  component-type: (string-ascii 100),
  contract-value: uint,
  delivery-schedule: uint,
  quality-standard: (string-ascii 100),
  status: (string-ascii 20),
  signed-at: uint
})

(define-map component-deliveries uint {
  contract-id: uint,
  component-id: (string-ascii 50),
  quantity: uint,
  delivered-at: uint,
  quality-verified: bool
})

(define-data-var contract-nonce uint u0)
(define-data-var delivery-nonce uint u0)

(define-public (create-oem-contract (shipbuilder principal) (component (string-ascii 100)) (value uint) (schedule uint) (quality (string-ascii 100)))
  (let ((id (+ (var-get contract-nonce) u1)))
    (map-set oem-contracts id {
      oem: tx-sender,
      shipbuilder: shipbuilder,
      component-type: component,
      contract-value: value,
      delivery-schedule: schedule,
      quality-standard: quality,
      status: "active",
      signed-at: block-height
    })
    (var-set contract-nonce id)
    (ok id)))

(define-public (record-delivery (contract-id uint) (component-id (string-ascii 50)) (qty uint))
  (let ((contract (unwrap! (map-get? oem-contracts contract-id) err-not-found))
        (id (+ (var-get delivery-nonce) u1)))
    (asserts! (is-eq tx-sender (get oem contract)) err-unauthorized)
    (map-set component-deliveries id {
      contract-id: contract-id,
      component-id: component-id,
      quantity: qty,
      delivered-at: block-height,
      quality-verified: false
    })
    (var-set delivery-nonce id)
    (ok id)))

(define-public (verify-quality (delivery-id uint))
  (let ((delivery (unwrap! (map-get? component-deliveries delivery-id) err-not-found))
        (contract (unwrap! (map-get? oem-contracts (get contract-id delivery)) err-not-found)))
    (asserts! (is-eq tx-sender (get shipbuilder contract)) err-unauthorized)
    (map-set component-deliveries delivery-id (merge delivery {quality-verified: true}))
    (ok true)))

(define-read-only (get-contract (id uint))
  (ok (map-get? oem-contracts id)))

(define-read-only (get-delivery (id uint))
  (ok (map-get? component-deliveries id)))
