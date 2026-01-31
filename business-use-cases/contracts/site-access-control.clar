(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map site-access
  { site-id: uint, worker: principal }
  {
    access-granted: bool,
    granted-at: uint,
    expires-at: uint
  }
)

(define-public (grant-site-access (site-id uint) (worker principal) (validity-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set site-access { site-id: site-id, worker: worker }
      {
        access-granted: true,
        granted-at: stacks-block-height,
        expires-at: (+ stacks-block-height validity-period)
      }
    )
    (ok true)
  )
)

(define-public (revoke-site-access (site-id uint) (worker principal))
  (let ((access (unwrap! (map-get? site-access { site-id: site-id, worker: worker }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set site-access { site-id: site-id, worker: worker } (merge access { access-granted: false }))
    (ok true)
  )
)

(define-read-only (check-site-access (site-id uint) (worker principal))
  (ok (map-get? site-access { site-id: site-id, worker: worker }))
)
