(define-map data-room-access
  { access-id: uint }
  {
    startup-id: uint,
    accessor: principal,
    access-type: (string-ascii 50),
    granted-at: uint,
    expires-at: (optional uint),
    revoked: bool
  }
)

(define-data-var access-nonce uint u0)

(define-public (grant-data-room-access (startup uint) (accessor principal) (access-type (string-ascii 50)) (expires (optional uint)))
  (let ((access-id (+ (var-get access-nonce) u1)))
    (map-set data-room-access
      { access-id: access-id }
      {
        startup-id: startup,
        accessor: accessor,
        access-type: access-type,
        granted-at: stacks-block-height,
        expires-at: expires,
        revoked: false
      }
    )
    (var-set access-nonce access-id)
    (ok access-id)
  )
)

(define-public (revoke-access (access-id uint))
  (match (map-get? data-room-access { access-id: access-id })
    access (ok (map-set data-room-access { access-id: access-id } (merge access { revoked: true })))
    (err u404)
  )
)

(define-read-only (get-data-room-access (access-id uint))
  (map-get? data-room-access { access-id: access-id })
)
