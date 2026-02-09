(define-map autonomy-levels principal {level: uint, constraints: (buff 64), set-at: uint})
(define-map level-history {agent: principal, sequence: uint} {level: uint, timestamp: uint})
(define-map level-change-count principal uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-LEVEL (err u108))

(define-public (set-autonomy-level (level uint) (constraints (buff 64)))
  (let ((agent tx-sender)
        (seq (default-to u0 (map-get? level-change-count agent))))
    (asserts! (<= level u10) ERR-INVALID-LEVEL)
    (map-set autonomy-levels agent {level: level, constraints: constraints, set-at: stacks-block-height})
    (map-set level-history {agent: agent, sequence: seq} {level: level, timestamp: stacks-block-height})
    (map-set level-change-count agent (+ seq u1))
    (ok level)))

(define-public (update-constraints (constraints (buff 64)))
  (let ((level-data (unwrap! (map-get? autonomy-levels tx-sender) ERR-NOT-AUTHORIZED)))
    (ok (map-set autonomy-levels tx-sender (merge level-data {constraints: constraints})))))

(define-read-only (get-autonomy-level (agent principal))
  (map-get? autonomy-levels agent))

(define-read-only (get-level-history (agent principal) (sequence uint))
  (map-get? level-history {agent: agent, sequence: sequence}))
