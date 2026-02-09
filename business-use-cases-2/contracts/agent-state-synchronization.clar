(define-map agent-state principal {state-hash: (buff 32), last-sync: uint, version: uint})
(define-map sync-history {agent: principal, sequence: uint} {state-hash: (buff 32), timestamp: uint})
(define-map sync-count principal uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))

(define-public (sync-state (state-hash (buff 32)))
  (let ((agent tx-sender)
        (current-state (default-to {state-hash: 0x00, last-sync: u0, version: u0} (map-get? agent-state agent)))
        (seq (default-to u0 (map-get? sync-count agent))))
    (map-set agent-state agent {state-hash: state-hash, last-sync: stacks-block-height, version: (+ (get version current-state) u1)})
    (map-set sync-history {agent: agent, sequence: seq} {state-hash: state-hash, timestamp: stacks-block-height})
    (map-set sync-count agent (+ seq u1))
    (ok true)))

(define-read-only (get-state (agent principal))
  (map-get? agent-state agent))

(define-read-only (get-sync-history (agent principal) (sequence uint))
  (map-get? sync-history {agent: agent, sequence: sequence}))
