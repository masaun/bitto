(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map retirement-plans principal {retirement-date: uint, archive-location: (string-ascii 128), data-retention: uint})

(define-public (plan-retirement (agent principal) (retirement-date uint) (archive-location (string-ascii 128)) (data-retention uint))
  (begin
    (asserts! (> retirement-date stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set retirement-plans agent {retirement-date: retirement-date, archive-location: archive-location, data-retention: data-retention}))))

(define-read-only (get-retirement-plan (agent principal))
  (ok (map-get? retirement-plans agent)))
