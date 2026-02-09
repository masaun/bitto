(define-map terminations principal {terminated: bool, reason: (string-ascii 128), terminated-at: uint, final-state: (buff 32)})
(define-map termination-approvals {agent: principal, approver: principal} bool)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-TERMINATED (err u106))

(define-public (request-termination (reason (string-ascii 128)) (final-state (buff 32)))
  (let ((agent tx-sender))
    (asserts! (is-none (map-get? terminations agent)) ERR-ALREADY-TERMINATED)
    (ok (map-set terminations agent {terminated: false, reason: reason, terminated-at: stacks-block-height, final-state: final-state}))))

(define-public (approve-termination (agent principal))
  (begin
    (ok (map-set termination-approvals {agent: agent, approver: tx-sender} true))))

(define-public (execute-termination)
  (let ((agent tx-sender)
        (termination (unwrap! (map-get? terminations agent) ERR-ALREADY-TERMINATED)))
    (ok (map-set terminations agent (merge termination {terminated: true})))))

(define-read-only (get-termination (agent principal))
  (map-get? terminations agent))

(define-read-only (is-terminated (agent principal))
  (match (map-get? terminations agent)
    term (get terminated term)
    false))

(define-read-only (get-approval (agent principal) (approver principal))
  (default-to false (map-get? termination-approvals {agent: agent, approver: approver})))
