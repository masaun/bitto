(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map latency-targets uint {service: (string-ascii 64), target-ms: uint, current-ms: uint})

(define-public (set-latency-target (service (string-ascii 64)) (target-ms uint))
  (let ((target-id service))
    (asserts! (> target-ms u0) ERR-INVALID-PARAMETER)
    (ok (map-set latency-targets u1 {service: service, target-ms: target-ms, current-ms: u0}))))

(define-read-only (get-latency-target (target-id uint))
  (ok (map-get? latency-targets target-id)))
