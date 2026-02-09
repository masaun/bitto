(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map hitl-tasks uint {task-id: (string-ascii 64), agent: principal, human-required: bool, completed: bool})
(define-data-var task-nonce uint u0)

(define-public (create-hitl-task (task-id (string-ascii 64)))
  (let ((id (+ (var-get task-nonce) u1)))
    (map-set hitl-tasks id {task-id: task-id, agent: tx-sender, human-required: true, completed: false})
    (var-set task-nonce id)
    (ok id)))

(define-read-only (get-hitl-task (id uint))
  (ok (map-get? hitl-tasks id)))
