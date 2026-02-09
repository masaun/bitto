(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map maintenance-schedules principal {next-maintenance: uint, frequency: uint, last-completed: uint})

(define-public (schedule-maintenance (agent principal) (next-maintenance uint) (frequency uint))
  (begin
    (asserts! (> next-maintenance stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set maintenance-schedules agent {next-maintenance: next-maintenance, frequency: frequency, last-completed: u0}))))

(define-read-only (get-maintenance-schedule (agent principal))
  (ok (map-get? maintenance-schedules agent)))
