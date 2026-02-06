(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map production-orders uint {
  shipyard: principal,
  buyer: principal,
  ship-type: (string-ascii 50),
  specification-hash: (string-ascii 64),
  order-value: uint,
  delivery-date: uint,
  status: (string-ascii 20),
  placed-at: uint
})

(define-map production-milestones uint {
  order-id: uint,
  milestone-name: (string-ascii 100),
  completion-percentage: uint,
  payment-percentage: uint,
  completed: bool,
  completed-at: uint
})

(define-data-var order-nonce uint u0)
(define-data-var milestone-nonce uint u0)

(define-public (place-production-order (shipyard principal) (ship-type (string-ascii 50)) (spec-hash (string-ascii 64)) (value uint) (delivery uint))
  (let ((id (+ (var-get order-nonce) u1)))
    (map-set production-orders id {
      shipyard: shipyard,
      buyer: tx-sender,
      ship-type: ship-type,
      specification-hash: spec-hash,
      order-value: value,
      delivery-date: delivery,
      status: "pending",
      placed-at: block-height
    })
    (var-set order-nonce id)
    (ok id)))

(define-public (add-milestone (order-id uint) (name (string-ascii 100)) (completion-pct uint) (payment-pct uint))
  (let ((order (unwrap! (map-get? production-orders order-id) err-not-found))
        (id (+ (var-get milestone-nonce) u1)))
    (asserts! (is-eq tx-sender (get shipyard order)) err-unauthorized)
    (map-set production-milestones id {
      order-id: order-id,
      milestone-name: name,
      completion-percentage: completion-pct,
      payment-percentage: payment-pct,
      completed: false,
      completed-at: u0
    })
    (var-set milestone-nonce id)
    (ok id)))

(define-public (complete-milestone (milestone-id uint))
  (let ((milestone (unwrap! (map-get? production-milestones milestone-id) err-not-found))
        (order (unwrap! (map-get? production-orders (get order-id milestone)) err-not-found)))
    (asserts! (is-eq tx-sender (get shipyard order)) err-unauthorized)
    (map-set production-milestones milestone-id (merge milestone {
      completed: true,
      completed-at: block-height
    }))
    (ok true)))

(define-read-only (get-order (id uint))
  (ok (map-get? production-orders id)))

(define-read-only (get-milestone (id uint))
  (ok (map-get? production-milestones id)))
