(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map access-control
  { data-id: uint, personnel: principal }
  {
    clearance-required: uint,
    access-granted: bool,
    granted-at: uint
  }
)

(define-public (grant-access (data-id uint) (personnel principal) (clearance-required uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set access-control { data-id: data-id, personnel: personnel }
      {
        clearance-required: clearance-required,
        access-granted: true,
        granted-at: stacks-block-height
      }
    )
    (ok true)
  )
)

(define-public (revoke-access (data-id uint) (personnel principal))
  (let ((access (unwrap! (map-get? access-control { data-id: data-id, personnel: personnel }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set access-control { data-id: data-id, personnel: personnel }
      (merge access { access-granted: false })
    )
    (ok true)
  )
)

(define-read-only (check-access (data-id uint) (personnel principal))
  (ok (map-get? access-control { data-id: data-id, personnel: personnel }))
)
