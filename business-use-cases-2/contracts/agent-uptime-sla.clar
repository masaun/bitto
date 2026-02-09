(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map sla-records principal {uptime-percentage: uint, sla-target: uint, violations: uint})

(define-public (set-sla (uptime-percentage uint) (sla-target uint))
  (begin
    (asserts! (and (<= uptime-percentage u100) (<= sla-target u100)) ERR-INVALID-PARAMETER)
    (ok (map-set sla-records tx-sender {uptime-percentage: uptime-percentage, sla-target: sla-target, violations: u0}))))

(define-read-only (get-sla (agent principal))
  (ok (map-get? sla-records agent)))
