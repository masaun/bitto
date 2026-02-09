(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map retention-policies principal {max-age: uint, max-size: uint, priority-threshold: uint})

(define-public (set-policy (max-age uint) (max-size uint) (priority uint))
  (begin
    (asserts! (and (> max-age u0) (> max-size u0)) ERR-INVALID-PARAMETER)
    (ok (map-set retention-policies tx-sender {max-age: max-age, max-size: max-size, priority-threshold: priority}))))

(define-read-only (get-policy (agent principal))
  (ok (map-get? retention-policies agent)))
