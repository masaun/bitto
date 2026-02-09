(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map risk-dashboard principal {total-risks: uint, high-severity: uint, mitigated: uint, overall-score: uint})

(define-public (update-dashboard (total-risks uint) (high-severity uint) (mitigated uint) (overall-score uint))
  (begin
    (asserts! (<= overall-score u100) ERR-INVALID-PARAMETER)
    (ok (map-set risk-dashboard tx-sender {total-risks: total-risks, high-severity: high-severity, mitigated: mitigated, overall-score: overall-score}))))

(define-read-only (get-dashboard (entity principal))
  (ok (map-get? risk-dashboard entity)))
