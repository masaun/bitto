(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map gpu-allocations uint {user: principal, gpu-count: uint, allocated-at: uint, released: bool})
(define-data-var allocation-nonce uint u0)

(define-public (allocate-gpu (gpu-count uint))
  (let ((alloc-id (+ (var-get allocation-nonce) u1)))
    (asserts! (> gpu-count u0) ERR-INVALID-PARAMETER)
    (map-set gpu-allocations alloc-id {user: tx-sender, gpu-count: gpu-count, allocated-at: stacks-block-height, released: false})
    (var-set allocation-nonce alloc-id)
    (ok alloc-id)))

(define-read-only (get-allocation (alloc-id uint))
  (ok (map-get? gpu-allocations alloc-id)))
