(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map value-alignment principal {core-values: (string-ascii 256), alignment-score: uint, last-assessed: uint})

(define-public (assess-value-alignment (agent principal) (core-values (string-ascii 256)) (alignment-score uint))
  (begin
    (asserts! (<= alignment-score u100) ERR-INVALID-PARAMETER)
    (ok (map-set value-alignment agent {core-values: core-values, alignment-score: alignment-score, last-assessed: stacks-block-height}))))

(define-read-only (get-value-alignment (agent principal))
  (ok (map-get? value-alignment agent)))
