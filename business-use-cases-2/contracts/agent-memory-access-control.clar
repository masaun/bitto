(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map access-control {memory-id: uint, accessor: principal} {granted: bool, level: uint})

(define-public (grant-access (memory-id uint) (accessor principal) (level uint))
  (begin
    (asserts! (<= level u3) ERR-INVALID-PARAMETER)
    (ok (map-set access-control {memory-id: memory-id, accessor: accessor} {granted: true, level: level}))))

(define-public (revoke-access (memory-id uint) (accessor principal))
  (ok (map-set access-control {memory-id: memory-id, accessor: accessor} {granted: false, level: u0})))

(define-read-only (check-access (memory-id uint) (accessor principal))
  (ok (map-get? access-control {memory-id: memory-id, accessor: accessor})))
