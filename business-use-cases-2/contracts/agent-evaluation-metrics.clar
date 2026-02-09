(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map metrics principal {accuracy: uint, precision: uint, recall: uint, f1-score: uint})

(define-public (set-metrics (accuracy uint) (precision uint) (recall uint) (f1 uint))
  (begin
    (asserts! (and (<= accuracy u100) (<= precision u100) (<= recall u100) (<= f1 u100)) ERR-INVALID-PARAMETER)
    (ok (map-set metrics tx-sender {accuracy: accuracy, precision: precision, recall: recall, f1-score: f1}))))

(define-read-only (get-metrics (agent principal))
  (ok (map-get? metrics agent)))
