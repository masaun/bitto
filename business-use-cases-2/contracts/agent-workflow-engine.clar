(define-map workflows {workflow-id: uint} {creator: principal, status: (string-ascii 16), created-at: uint})
(define-map workflow-steps {workflow-id: uint, step: uint} {action: (string-ascii 64), agent: (optional principal), completed: bool})
(define-map workflow-step-count uint uint)
(define-data-var workflow-counter uint u0)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-WORKFLOW-NOT-FOUND (err u102))

(define-public (create-workflow)
  (let ((workflow-id (var-get workflow-counter)))
    (map-set workflows {workflow-id: workflow-id} {creator: tx-sender, status: "active", created-at: stacks-block-height})
    (var-set workflow-counter (+ workflow-id u1))
    (ok workflow-id)))

(define-public (add-step (workflow-id uint) (action (string-ascii 64)) (agent (optional principal)))
  (let ((workflow (unwrap! (map-get? workflows {workflow-id: workflow-id}) ERR-WORKFLOW-NOT-FOUND))
        (step-num (default-to u0 (map-get? workflow-step-count workflow-id))))
    (asserts! (is-eq (get creator workflow) tx-sender) ERR-NOT-AUTHORIZED)
    (map-set workflow-steps {workflow-id: workflow-id, step: step-num} {action: action, agent: agent, completed: false})
    (map-set workflow-step-count workflow-id (+ step-num u1))
    (ok step-num)))

(define-public (complete-step (workflow-id uint) (step uint))
  (let ((step-data (unwrap! (map-get? workflow-steps {workflow-id: workflow-id, step: step}) ERR-WORKFLOW-NOT-FOUND)))
    (ok (map-set workflow-steps {workflow-id: workflow-id, step: step} (merge step-data {completed: true})))))

(define-read-only (get-workflow (workflow-id uint))
  (map-get? workflows {workflow-id: workflow-id}))

(define-read-only (get-step (workflow-id uint) (step uint))
  (map-get? workflow-steps {workflow-id: workflow-id, step: step}))
