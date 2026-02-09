(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map zero-trust-policies principal {verify-always: bool, least-privilege: bool, trust-score: uint})

(define-public (set-zero-trust (verify-always bool) (least-privilege bool) (trust-score uint))
  (begin
    (asserts! (<= trust-score u100) ERR-INVALID-PARAMETER)
    (ok (map-set zero-trust-policies tx-sender {verify-always: verify-always, least-privilege: least-privilege, trust-score: trust-score}))))

(define-read-only (get-policy (agent principal))
  (ok (map-get? zero-trust-policies agent)))
