(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map remediation-tasks uint {incident-id: uint, action: (string-ascii 128), completed: bool, timestamp: uint})
(define-data-var task-nonce uint u0)

(define-public (create-remediation (incident-id uint) (action (string-ascii 128)))
  (let ((task-id (+ (var-get task-nonce) u1)))
    (map-set remediation-tasks task-id {incident-id: incident-id, action: action, completed: false, timestamp: stacks-block-height})
    (var-set task-nonce task-id)
    (ok task-id)))

(define-public (complete-remediation (task-id uint))
  (let ((task (unwrap! (map-get? remediation-tasks task-id) ERR-NOT-FOUND)))
    (ok (map-set remediation-tasks task-id (merge task {completed: true})))))

(define-read-only (get-remediation (task-id uint))
  (ok (map-get? remediation-tasks task-id)))
