(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map deployments
  { deployment-id: uint }
  {
    asset-id: uint,
    location: (string-ascii 100),
    status: (string-ascii 20),
    deployed-at: uint
  }
)

(define-data-var deployment-nonce uint u0)

(define-public (create-deployment (asset-id uint) (location (string-ascii 100)))
  (let ((deployment-id (+ (var-get deployment-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set deployments { deployment-id: deployment-id }
      {
        asset-id: asset-id,
        location: location,
        status: "planned",
        deployed-at: stacks-block-height
      }
    )
    (var-set deployment-nonce deployment-id)
    (ok deployment-id)
  )
)

(define-public (update-deployment-status (deployment-id uint) (status (string-ascii 20)))
  (let ((deployment (unwrap! (map-get? deployments { deployment-id: deployment-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set deployments { deployment-id: deployment-id } (merge deployment { status: status }))
    (ok true)
  )
)

(define-read-only (get-deployment (deployment-id uint))
  (ok (map-get? deployments { deployment-id: deployment-id }))
)

(define-read-only (get-deployment-count)
  (ok (var-get deployment-nonce))
)
