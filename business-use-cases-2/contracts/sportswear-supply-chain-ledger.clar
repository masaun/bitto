(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-invalid-status (err u102))

(define-map products uint {name: (string-ascii 50), manufacturer: principal, origin: (string-ascii 40), verified: bool})
(define-map shipments {product-id: uint, batch: uint} {destination: (string-ascii 40), timestamp: uint, delivered: bool})
(define-data-var product-nonce uint u0)
(define-data-var total-verified uint u0)

(define-read-only (get-product (product-id uint))
  (map-get? products product-id))

(define-read-only (get-shipment (product-id uint) (batch uint))
  (map-get? shipments {product-id: product-id, batch: batch}))

(define-read-only (get-total-verified)
  (ok (var-get total-verified)))

(define-public (register-product (name (string-ascii 50)) (origin (string-ascii 40)))
  (let ((product-id (+ (var-get product-nonce) u1)))
    (map-set products product-id {name: name, manufacturer: tx-sender, origin: origin, verified: false})
    (var-set product-nonce product-id)
    (ok product-id)))

(define-public (verify-product (product-id uint))
  (let ((product (unwrap! (map-get? products product-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set products product-id (merge product {verified: true}))
    (var-set total-verified (+ (var-get total-verified) u1))
    (ok true)))

(define-public (record-shipment (product-id uint) (batch uint) (destination (string-ascii 40)))
  (let ((product (unwrap! (map-get? products product-id) err-not-found)))
    (asserts! (is-eq tx-sender (get manufacturer product)) err-owner-only)
    (map-set shipments {product-id: product-id, batch: batch} {destination: destination, timestamp: burn-block-height, delivered: false})
    (ok true)))

(define-public (confirm-delivery (product-id uint) (batch uint))
  (let ((shipment (unwrap! (map-get? shipments {product-id: product-id, batch: batch}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set shipments {product-id: product-id, batch: batch} (merge shipment {delivered: true}))
    (ok true)))
