(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u101))

(define-map workflows (string-ascii 64) {owner: principal, status: (string-ascii 20), created-at: uint})
(define-map workflow-steps uint {workflow-id: (string-ascii 64), step-name: (string-ascii 64), completed: bool, timestamp: uint})
(define-data-var step-nonce uint u0)

(define-public (create-workflow (workflow-id (string-ascii 64)))
  (ok (map-set workflows workflow-id {owner: tx-sender, status: "active", created-at: stacks-block-height})))

(define-public (add-step (workflow-id (string-ascii 64)) (step-name (string-ascii 64)))
  (let ((id (var-get step-nonce)))
    (map-set workflow-steps id {workflow-id: workflow-id, step-name: step-name, completed: false, timestamp: stacks-block-height})
    (var-set step-nonce (+ id u1))
    (ok id)))

(define-public (complete-step (step-id uint))
  (let ((step (unwrap! (map-get? workflow-steps step-id) err-not-found)))
    (ok (map-set workflow-steps step-id (merge step {completed: true, timestamp: stacks-block-height})))))

(define-read-only (get-workflow (workflow-id (string-ascii 64)))
  (ok (map-get? workflows workflow-id)))

(define-read-only (get-step (step-id uint))
  (ok (map-get? workflow-steps step-id)))
