(define-constant contract-owner tx-sender)

(define-map routes (string-ascii 64) {origin: (string-ascii 64), destination: (string-ascii 64), distance: uint, estimated-time: uint})
(define-map route-optimizations uint {route-id: (string-ascii 64), optimization-type: (string-ascii 32), value: uint, created-at: uint})
(define-data-var optimization-nonce uint u0)

(define-public (create-route (route-id (string-ascii 64)) (origin (string-ascii 64)) (dest (string-ascii 64)) (distance uint) (time uint))
  (ok (map-set routes route-id {origin: origin, destination: dest, distance: distance, estimated-time: time})))

(define-public (add-optimization (route-id (string-ascii 64)) (opt-type (string-ascii 32)) (value uint))
  (let ((id (var-get optimization-nonce)))
    (map-set route-optimizations id {route-id: route-id, optimization-type: opt-type, value: value, created-at: stacks-block-height})
    (var-set optimization-nonce (+ id u1))
    (ok id)))

(define-read-only (get-route (route-id (string-ascii 64)))
  (ok (map-get? routes route-id)))

(define-read-only (get-optimization (opt-id uint))
  (ok (map-get? route-optimizations opt-id)))
