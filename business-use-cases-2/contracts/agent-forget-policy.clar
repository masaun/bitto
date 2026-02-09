(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map forget-policies principal {auto-forget: bool, retention-days: uint, exception-count: uint})

(define-public (set-forget-policy (auto-forget bool) (retention-days uint))
  (begin
    (asserts! (> retention-days u0) ERR-INVALID-PARAMETER)
    (ok (map-set forget-policies tx-sender {auto-forget: auto-forget, retention-days: retention-days, exception-count: u0}))))

(define-read-only (get-forget-policy (agent principal))
  (ok (map-get? forget-policies agent)))
