(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map decommissioning-records
  { asset-id: uint }
  {
    asset-type: (string-ascii 50),
    decommissioned: bool,
    decommissioned-at: uint,
    method: (string-ascii 100)
  }
)

(define-public (decommission-asset (asset-id uint) (asset-type (string-ascii 50)) (method (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set decommissioning-records { asset-id: asset-id }
      {
        asset-type: asset-type,
        decommissioned: true,
        decommissioned-at: stacks-block-height,
        method: method
      }
    )
    (ok true)
  )
)

(define-read-only (get-decommissioning-record (asset-id uint))
  (ok (map-get? decommissioning-records { asset-id: asset-id }))
)
