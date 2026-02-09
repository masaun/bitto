(define-map recovery-plans {agent: principal, plan-id: uint} {strategy: (string-ascii 64), checkpoint: (buff 32), created-at: uint})
(define-map recovery-executions {agent: principal, execution-id: uint} {plan-id: uint, status: (string-ascii 16), executed-at: uint})
(define-map plan-count principal uint)
(define-map execution-count principal uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-PLAN-NOT-FOUND (err u102))

(define-public (create-recovery-plan (strategy (string-ascii 64)) (checkpoint (buff 32)))
  (let ((agent tx-sender)
        (plan-id (default-to u0 (map-get? plan-count agent))))
    (map-set recovery-plans {agent: agent, plan-id: plan-id} {strategy: strategy, checkpoint: checkpoint, created-at: stacks-block-height})
    (map-set plan-count agent (+ plan-id u1))
    (ok plan-id)))

(define-public (execute-recovery (plan-id uint))
  (let ((agent tx-sender)
        (execution-id (default-to u0 (map-get? execution-count agent))))
    (asserts! (is-some (map-get? recovery-plans {agent: agent, plan-id: plan-id})) ERR-PLAN-NOT-FOUND)
    (map-set recovery-executions {agent: agent, execution-id: execution-id} {plan-id: plan-id, status: "executing", executed-at: stacks-block-height})
    (map-set execution-count agent (+ execution-id u1))
    (ok execution-id)))

(define-read-only (get-recovery-plan (agent principal) (plan-id uint))
  (map-get? recovery-plans {agent: agent, plan-id: plan-id}))

(define-read-only (get-recovery-execution (agent principal) (execution-id uint))
  (map-get? recovery-executions {agent: agent, execution-id: execution-id}))
