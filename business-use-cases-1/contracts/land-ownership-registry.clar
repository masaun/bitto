(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map land-ownership
  { parcel-id: uint }
  {
    owner: principal,
    location: (string-ascii 100),
    area: uint,
    registered-at: uint
  }
)

(define-data-var parcel-nonce uint u0)

(define-public (register-land (owner principal) (location (string-ascii 100)) (area uint))
  (let ((parcel-id (+ (var-get parcel-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set land-ownership { parcel-id: parcel-id }
      {
        owner: owner,
        location: location,
        area: area,
        registered-at: stacks-block-height
      }
    )
    (var-set parcel-nonce parcel-id)
    (ok parcel-id)
  )
)

(define-public (transfer-ownership (parcel-id uint) (new-owner principal))
  (let ((parcel (unwrap! (map-get? land-ownership { parcel-id: parcel-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set land-ownership { parcel-id: parcel-id } (merge parcel { owner: new-owner }))
    (ok true)
  )
)

(define-read-only (get-land-ownership (parcel-id uint))
  (ok (map-get? land-ownership { parcel-id: parcel-id }))
)

(define-read-only (get-parcel-count)
  (ok (var-get parcel-nonce))
)
