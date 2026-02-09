(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map human-oversight principal {overseer: principal, oversight-level: uint, last-review: uint})

(define-public (assign-human-oversight (agent principal) (overseer principal) (oversight-level uint))
  (begin
    (asserts! (<= oversight-level u5) ERR-INVALID-PARAMETER)
    (ok (map-set human-oversight agent {overseer: overseer, oversight-level: oversight-level, last-review: stacks-block-height}))))

(define-read-only (get-human-oversight (agent principal))
  (ok (map-get? human-oversight agent)))
