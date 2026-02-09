(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map resource-quotas principal {cpu-quota: uint, memory-quota: uint, storage-quota: uint})

(define-public (set-quota (cpu-quota uint) (memory-quota uint) (storage-quota uint))
  (begin
    (asserts! (and (> cpu-quota u0) (> memory-quota u0) (> storage-quota u0)) ERR-INVALID-PARAMETER)
    (ok (map-set resource-quotas tx-sender {cpu-quota: cpu-quota, memory-quota: memory-quota, storage-quota: storage-quota}))))

(define-read-only (get-quota (tenant principal))
  (ok (map-get? resource-quotas tenant)))
