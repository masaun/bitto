(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map edge-deployments uint {agent-id: uint, location: (string-ascii 64), deployed: bool, timestamp: uint})
(define-data-var deployment-nonce uint u0)

(define-public (deploy-to-edge (agent-id uint) (location (string-ascii 64)))
  (let ((deploy-id (+ (var-get deployment-nonce) u1)))
    (map-set edge-deployments deploy-id {agent-id: agent-id, location: location, deployed: true, timestamp: stacks-block-height})
    (var-set deployment-nonce deploy-id)
    (ok deploy-id)))

(define-read-only (get-edge-deployment (deploy-id uint))
  (ok (map-get? edge-deployments deploy-id)))
