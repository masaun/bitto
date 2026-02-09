(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map minimization-policies principal {max-fields: uint, retention-hours: uint, strict-mode: bool})

(define-public (set-minimization-policy (max-fields uint) (retention-hours uint) (strict-mode bool))
  (begin
    (asserts! (> max-fields u0) ERR-INVALID-PARAMETER)
    (ok (map-set minimization-policies tx-sender {max-fields: max-fields, retention-hours: retention-hours, strict-mode: strict-mode}))))

(define-read-only (get-policy (agent principal))
  (ok (map-get? minimization-policies agent)))
