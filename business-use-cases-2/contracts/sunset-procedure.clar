(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map sunset-procedures principal {initiated-at: uint, completion-target: uint, steps-remaining: uint})

(define-public (initiate-sunset (agent principal) (completion-target uint) (steps-remaining uint))
  (begin
    (asserts! (> completion-target stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set sunset-procedures agent {initiated-at: stacks-block-height, completion-target: completion-target, steps-remaining: steps-remaining}))))

(define-read-only (get-sunset-procedure (agent principal))
  (ok (map-get? sunset-procedures agent)))
