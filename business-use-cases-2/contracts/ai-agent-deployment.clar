(define-map deployments {agent: principal, deployment-id: uint} {environment: (string-ascii 32), status: (string-ascii 16), timestamp: uint})
(define-map deployment-count principal uint)
(define-map active-deployments principal (list 5 uint))

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-DEPLOYMENT-NOT-FOUND (err u102))

(define-public (create-deployment (environment (string-ascii 32)))
  (let ((agent tx-sender)
        (deployment-id (default-to u0 (map-get? deployment-count agent))))
    (map-set deployments {agent: agent, deployment-id: deployment-id} {environment: environment, status: "pending", timestamp: stacks-block-height})
    (map-set deployment-count agent (+ deployment-id u1))
    (ok deployment-id)))

(define-public (update-deployment-status (deployment-id uint) (status (string-ascii 16)))
  (let ((agent tx-sender)
        (deployment (unwrap! (map-get? deployments {agent: agent, deployment-id: deployment-id}) ERR-DEPLOYMENT-NOT-FOUND)))
    (ok (map-set deployments {agent: agent, deployment-id: deployment-id} (merge deployment {status: status})))))

(define-public (activate-deployment (deployment-id uint))
  (let ((agent tx-sender)
        (active (default-to (list) (map-get? active-deployments agent))))
    (ok (map-set active-deployments agent (unwrap-panic (as-max-len? (append active deployment-id) u5))))))

(define-read-only (get-deployment (agent principal) (deployment-id uint))
  (map-get? deployments {agent: agent, deployment-id: deployment-id}))

(define-read-only (get-active-deployments (agent principal))
  (map-get? active-deployments agent))
