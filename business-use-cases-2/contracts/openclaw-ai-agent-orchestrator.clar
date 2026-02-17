(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))

(define-map agents principal {name: (string-ascii 64), status: (string-ascii 20), registered-at: uint})
(define-map agent-tasks uint {agent: principal, task: (string-ascii 256), created-at: uint})
(define-data-var task-nonce uint u0)

(define-public (register-agent (name (string-ascii 64)))
  (let ((caller tx-sender))
    (asserts! (is-none (map-get? agents caller)) err-already-exists)
    (ok (map-set agents caller {name: name, status: "active", registered-at: stacks-block-height}))))

(define-public (create-task (agent principal) (task (string-ascii 256)))
  (let ((task-id (var-get task-nonce)))
    (map-set agent-tasks task-id {agent: agent, task: task, created-at: stacks-block-height})
    (var-set task-nonce (+ task-id u1))
    (ok task-id)))

(define-public (update-agent-status (status (string-ascii 20)))
  (let ((agent-data (unwrap! (map-get? agents tx-sender) err-not-found)))
    (ok (map-set agents tx-sender (merge agent-data {status: status})))))

(define-read-only (get-agent (agent principal))
  (ok (map-get? agents agent)))

(define-read-only (get-task (task-id uint))
  (ok (map-get? agent-tasks task-id)))
