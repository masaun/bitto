(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map evaluations uint {model-id: uint, evaluator: principal, score: uint, timestamp: uint})
(define-data-var eval-nonce uint u0)

(define-public (submit-evaluation (model-id uint) (score uint))
  (let ((eval-id (+ (var-get eval-nonce) u1)))
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (map-set evaluations eval-id {model-id: model-id, evaluator: tx-sender, score: score, timestamp: stacks-block-height})
    (var-set eval-nonce eval-id)
    (ok eval-id)))

(define-read-only (get-evaluation (eval-id uint))
  (ok (map-get? evaluations eval-id)))
