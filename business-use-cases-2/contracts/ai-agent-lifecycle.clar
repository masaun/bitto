(define-map lifecycle-state principal {stage: (string-ascii 16), last-transition: uint})
(define-map transition-history {agent: principal, sequence: uint} {from: (string-ascii 16), to: (string-ascii 16), timestamp: uint})
(define-map transition-count principal uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-TRANSITION (err u103))

(define-public (initialize-lifecycle)
  (let ((agent tx-sender))
    (ok (map-set lifecycle-state agent {stage: "created", last-transition: stacks-block-height}))))

(define-public (transition-to (new-stage (string-ascii 16)))
  (let ((agent tx-sender)
        (current-state (unwrap! (map-get? lifecycle-state agent) ERR-INVALID-TRANSITION))
        (seq (default-to u0 (map-get? transition-count agent))))
    (map-set transition-history {agent: agent, sequence: seq} {from: (get stage current-state), to: new-stage, timestamp: stacks-block-height})
    (map-set lifecycle-state agent {stage: new-stage, last-transition: stacks-block-height})
    (map-set transition-count agent (+ seq u1))
    (ok new-stage)))

(define-read-only (get-lifecycle-state (agent principal))
  (map-get? lifecycle-state agent))

(define-read-only (get-transition (agent principal) (sequence uint))
  (map-get? transition-history {agent: agent, sequence: sequence}))

(define-read-only (get-transition-count (agent principal))
  (map-get? transition-count agent))
