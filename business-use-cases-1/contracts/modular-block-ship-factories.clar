(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map factory-modules uint {
  module-type: (string-ascii 100),
  factory-id: uint,
  capacity-per-month: uint,
  owner: principal,
  active: bool,
  installed-at: uint
})

(define-map production-blocks uint {
  block-id: (string-ascii 50),
  module-id: uint,
  ship-order-id: uint,
  block-type: (string-ascii 50),
  production-status: (string-ascii 20),
  started-at: uint,
  completed-at: uint
})

(define-data-var module-nonce uint u0)
(define-data-var block-nonce uint u0)

(define-public (register-factory-module (module-type (string-ascii 100)) (factory-id uint) (capacity uint))
  (let ((id (+ (var-get module-nonce) u1)))
    (map-set factory-modules id {
      module-type: module-type,
      factory-id: factory-id,
      capacity-per-month: capacity,
      owner: tx-sender,
      active: true,
      installed-at: block-height
    })
    (var-set module-nonce id)
    (ok id)))

(define-public (start-block-production (block-id (string-ascii 50)) (module-id uint) (order-id uint) (block-type (string-ascii 50)))
  (let ((module (unwrap! (map-get? factory-modules module-id) err-not-found))
        (id (+ (var-get block-nonce) u1)))
    (asserts! (is-eq tx-sender (get owner module)) err-unauthorized)
    (map-set production-blocks id {
      block-id: block-id,
      module-id: module-id,
      ship-order-id: order-id,
      block-type: block-type,
      production-status: "in-progress",
      started-at: block-height,
      completed-at: u0
    })
    (var-set block-nonce id)
    (ok id)))

(define-public (complete-block (block-id uint))
  (let ((block (unwrap! (map-get? production-blocks block-id) err-not-found))
        (module (unwrap! (map-get? factory-modules (get module-id block)) err-not-found)))
    (asserts! (is-eq tx-sender (get owner module)) err-unauthorized)
    (map-set production-blocks block-id (merge block {
      production-status: "completed",
      completed-at: block-height
    }))
    (ok true)))

(define-read-only (get-module (id uint))
  (ok (map-get? factory-modules id)))

(define-read-only (get-block (id uint))
  (ok (map-get? production-blocks id)))
