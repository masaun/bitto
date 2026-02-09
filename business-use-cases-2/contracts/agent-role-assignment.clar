(define-map roles principal {role: (string-ascii 32), permissions: uint, assigned-at: uint})
(define-map role-history {agent: principal, sequence: uint} {role: (string-ascii 32), timestamp: uint})
(define-map role-change-count principal uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))

(define-public (assign-role (agent principal) (role (string-ascii 32)) (permissions uint))
  (let ((seq (default-to u0 (map-get? role-change-count agent))))
    (map-set roles agent {role: role, permissions: permissions, assigned-at: stacks-block-height})
    (map-set role-history {agent: agent, sequence: seq} {role: role, timestamp: stacks-block-height})
    (map-set role-change-count agent (+ seq u1))
    (ok true)))

(define-public (update-permissions (permissions uint))
  (let ((role-data (unwrap! (map-get? roles tx-sender) ERR-NOT-AUTHORIZED)))
    (ok (map-set roles tx-sender (merge role-data {permissions: permissions})))))

(define-read-only (get-role (agent principal))
  (map-get? roles agent))

(define-read-only (get-role-history (agent principal) (sequence uint))
  (map-get? role-history {agent: agent, sequence: sequence}))
