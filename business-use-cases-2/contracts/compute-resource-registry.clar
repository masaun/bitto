(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map compute-resources uint {name: (string-ascii 64), type: (string-ascii 32), capacity: uint, allocated: uint})
(define-data-var resource-nonce uint u0)

(define-public (register-resource (name (string-ascii 64)) (type (string-ascii 32)) (capacity uint))
  (let ((resource-id (+ (var-get resource-nonce) u1)))
    (asserts! (> capacity u0) ERR-INVALID-PARAMETER)
    (map-set compute-resources resource-id {name: name, type: type, capacity: capacity, allocated: u0})
    (var-set resource-nonce resource-id)
    (ok resource-id)))

(define-read-only (get-resource (resource-id uint))
  (ok (map-get? compute-resources resource-id)))
