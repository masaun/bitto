(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map security-policies principal {encryption-required: bool, mfa-enabled: bool, audit-level: uint})

(define-public (set-policy (encryption-required bool) (mfa-enabled bool) (audit-level uint))
  (begin
    (asserts! (<= audit-level u3) ERR-INVALID-PARAMETER)
    (ok (map-set security-policies tx-sender {encryption-required: encryption-required, mfa-enabled: mfa-enabled, audit-level: audit-level}))))

(define-read-only (get-policy (agent principal))
  (ok (map-get? security-policies agent)))
