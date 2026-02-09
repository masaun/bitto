(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map fairness-scores uint {agent: principal, metric: (string-ascii 32), score: uint, timestamp: uint})
(define-data-var score-nonce uint u0)

(define-public (record-fairness (metric (string-ascii 32)) (score uint))
  (let ((score-id (+ (var-get score-nonce) u1)))
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (map-set fairness-scores score-id {agent: tx-sender, metric: metric, score: score, timestamp: stacks-block-height})
    (var-set score-nonce score-id)
    (ok score-id)))

(define-read-only (get-fairness-score (score-id uint))
  (ok (map-get? fairness-scores score-id)))
