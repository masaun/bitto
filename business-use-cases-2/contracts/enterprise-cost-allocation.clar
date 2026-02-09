(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map cost-allocations {tenant: principal, resource: (string-ascii 64)} {amount: uint, timestamp: uint})

(define-public (allocate-cost (resource (string-ascii 64)) (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-PARAMETER)
    (ok (map-set cost-allocations {tenant: tx-sender, resource: resource} {amount: amount, timestamp: stacks-block-height}))))

(define-read-only (get-allocation (tenant principal) (resource (string-ascii 64)))
  (ok (map-get? cost-allocations {tenant: tenant, resource: resource})))
