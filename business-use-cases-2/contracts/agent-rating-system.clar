(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ratings {agent-id: uint, rater: principal} {score: uint, timestamp: uint})

(define-public (rate-agent (agent-id uint) (score uint))
  (begin
    (asserts! (<= score u5) ERR-INVALID-PARAMETER)
    (ok (map-set ratings {agent-id: agent-id, rater: tx-sender} {score: score, timestamp: stacks-block-height}))))

(define-read-only (get-rating (agent-id uint) (rater principal))
  (ok (map-get? ratings {agent-id: agent-id, rater: rater})))
