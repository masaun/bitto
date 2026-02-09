(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map usage-records {user: principal, resource: (string-ascii 64)} {units: uint, timestamp: uint})

(define-public (record-usage (resource (string-ascii 64)) (units uint))
  (begin
    (asserts! (> units u0) ERR-INVALID-PARAMETER)
    (ok (map-set usage-records {user: tx-sender, resource: resource} {units: units, timestamp: stacks-block-height}))))

(define-read-only (get-usage (user principal) (resource (string-ascii 64)))
  (ok (map-get? usage-records {user: user, resource: resource})))
