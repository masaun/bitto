(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u101))

(define-map products (string-ascii 64) {manufacturer: principal, origin: (string-ascii 64), created-at: uint})
(define-map product-events uint {product-id: (string-ascii 64), event-type: (string-ascii 32), location: (string-ascii 64), timestamp: uint})
(define-data-var event-nonce uint u0)

(define-public (register-product (product-id (string-ascii 64)) (origin (string-ascii 64)))
  (ok (map-set products product-id {manufacturer: tx-sender, origin: origin, created-at: stacks-block-height})))

(define-public (log-event (product-id (string-ascii 64)) (event-type (string-ascii 32)) (location (string-ascii 64)))
  (let ((id (var-get event-nonce)))
    (map-set product-events id {product-id: product-id, event-type: event-type, location: location, timestamp: stacks-block-height})
    (var-set event-nonce (+ id u1))
    (ok id)))

(define-read-only (get-product (product-id (string-ascii 64)))
  (ok (map-get? products product-id)))

(define-read-only (get-event (event-id uint))
  (ok (map-get? product-events event-id)))
