(define-map tasks {task-id: uint} {agent: principal, status: (string-ascii 16), priority: uint, created-at: uint})
(define-map task-queue principal (list 20 uint))
(define-data-var task-counter uint u0)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TASK-NOT-FOUND (err u102))

(define-public (create-task (agent principal) (priority uint))
  (let ((task-id (var-get task-counter)))
    (map-set tasks {task-id: task-id} {agent: agent, status: "pending", priority: priority, created-at: stacks-block-height})
    (var-set task-counter (+ task-id u1))
    (let ((queue (default-to (list) (map-get? task-queue agent))))
      (map-set task-queue agent (unwrap-panic (as-max-len? (append queue task-id) u20))))
    (ok task-id)))

(define-public (update-task-status (task-id uint) (status (string-ascii 16)))
  (let ((task (unwrap! (map-get? tasks {task-id: task-id}) ERR-TASK-NOT-FOUND)))
    (asserts! (is-eq (get agent task) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set tasks {task-id: task-id} (merge task {status: status})))))

(define-read-only (get-task (task-id uint))
  (map-get? tasks {task-id: task-id}))

(define-read-only (get-task-queue (agent principal))
  (map-get? task-queue agent))
