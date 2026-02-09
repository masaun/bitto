(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map performance-scores uint {model-id: uint, metric: (string-ascii 32), value: uint, timestamp: uint})
(define-data-var score-nonce uint u0)

(define-public (record-score (model-id uint) (metric (string-ascii 32)) (value uint))
  (let ((score-id (+ (var-get score-nonce) u1)))
    (asserts! (<= value u100) ERR-INVALID-PARAMETER)
    (map-set performance-scores score-id {model-id: model-id, metric: metric, value: value, timestamp: stacks-block-height})
    (var-set score-nonce score-id)
    (ok score-id)))

(define-read-only (get-score (score-id uint))
  (ok (map-get? performance-scores score-id)))
