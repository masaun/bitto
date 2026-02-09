(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map confidence-scores {agent: principal, task-id: uint} {score: uint, timestamp: uint})

(define-public (record-score (task-id uint) (score uint))
  (begin
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (ok (map-set confidence-scores {agent: tx-sender, task-id: task-id} {score: score, timestamp: stacks-block-height}))))

(define-read-only (get-score (agent principal) (task-id uint))
  (ok (map-get? confidence-scores {agent: agent, task-id: task-id})))
