(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map simulations uint {simulation-type: (string-ascii 64), parameters-hash: (buff 32), result-score: uint})
(define-data-var simulation-nonce uint u0)

(define-public (run-simulation (simulation-type (string-ascii 64)) (parameters-hash (buff 32)) (result-score uint))
  (let ((sim-id (+ (var-get simulation-nonce) u1)))
    (asserts! (<= result-score u100) ERR-INVALID-PARAMETER)
    (map-set simulations sim-id {simulation-type: simulation-type, parameters-hash: parameters-hash, result-score: result-score})
    (var-set simulation-nonce sim-id)
    (ok sim-id)))

(define-read-only (get-simulation (sim-id uint))
  (ok (map-get? simulations sim-id)))
