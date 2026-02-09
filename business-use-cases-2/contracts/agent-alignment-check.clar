(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map alignment-checks uint {agent: principal, check-type: (string-ascii 64), passed: bool, score: uint})
(define-data-var check-nonce uint u0)

(define-public (run-alignment-check (check-type (string-ascii 64)) (passed bool) (score uint))
  (let ((check-id (+ (var-get check-nonce) u1)))
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (map-set alignment-checks check-id {agent: tx-sender, check-type: check-type, passed: passed, score: score})
    (var-set check-nonce check-id)
    (ok check-id)))

(define-read-only (get-check (check-id uint))
  (ok (map-get? alignment-checks check-id)))
