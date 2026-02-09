(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map prompt-performance {prompt-id: uint, metric: (string-ascii 32)} {score: uint, samples: uint})

(define-public (record-performance (prompt-id uint) (metric (string-ascii 32)) (score uint))
  (begin
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (ok (map-set prompt-performance {prompt-id: prompt-id, metric: metric} {score: score, samples: u1}))))

(define-read-only (get-performance (prompt-id uint) (metric (string-ascii 32)))
  (ok (map-get? prompt-performance {prompt-id: prompt-id, metric: metric})))
