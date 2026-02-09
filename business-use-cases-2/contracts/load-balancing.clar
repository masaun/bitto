(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map load-balancers uint {name: (string-ascii 64), algorithm: (string-ascii 32), endpoints: uint})
(define-data-var lb-nonce uint u0)

(define-public (create-load-balancer (name (string-ascii 64)) (algorithm (string-ascii 32)) (endpoints uint))
  (let ((lb-id (+ (var-get lb-nonce) u1)))
    (asserts! (> endpoints u0) ERR-INVALID-PARAMETER)
    (map-set load-balancers lb-id {name: name, algorithm: algorithm, endpoints: endpoints})
    (var-set lb-nonce lb-id)
    (ok lb-id)))

(define-read-only (get-load-balancer (lb-id uint))
  (ok (map-get? load-balancers lb-id)))
