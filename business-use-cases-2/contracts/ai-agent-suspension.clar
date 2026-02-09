(define-map suspensions principal {suspended: bool, reason: (string-ascii 128), suspended-at: uint, suspended-until: (optional uint)})
(define-map suspension-history {agent: principal, sequence: uint} {reason: (string-ascii 128), timestamp: uint, duration: (optional uint)})
(define-map suspension-count principal uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-SUSPENDED (err u104))
(define-constant ERR-NOT-SUSPENDED (err u105))

(define-public (suspend-agent (reason (string-ascii 128)) (duration (optional uint)))
  (let ((agent tx-sender)
        (seq (default-to u0 (map-get? suspension-count agent))))
    (asserts! (is-none (map-get? suspensions agent)) ERR-ALREADY-SUSPENDED)
    (map-set suspensions agent {suspended: true, reason: reason, suspended-at: stacks-block-height, suspended-until: duration})
    (map-set suspension-history {agent: agent, sequence: seq} {reason: reason, timestamp: stacks-block-height, duration: duration})
    (map-set suspension-count agent (+ seq u1))
    (ok true)))

(define-public (lift-suspension)
  (let ((agent tx-sender))
    (asserts! (is-some (map-get? suspensions agent)) ERR-NOT-SUSPENDED)
    (ok (map-delete suspensions agent))))

(define-read-only (is-suspended (agent principal))
  (is-some (map-get? suspensions agent)))

(define-read-only (get-suspension (agent principal))
  (map-get? suspensions agent))

(define-read-only (get-suspension-history (agent principal) (sequence uint))
  (map-get? suspension-history {agent: agent, sequence: sequence}))
