(define-map access-control
  { control-id: uint }
  {
    investor-id: uint,
    resource-type: (string-ascii 50),
    resource-id: uint,
    access-level: (string-ascii 20),
    granted-at: uint,
    expires-at: (optional uint)
  }
)

(define-data-var control-nonce uint u0)

(define-public (grant-access (investor uint) (resource-type (string-ascii 50)) (resource uint) (access-level (string-ascii 20)) (expires (optional uint)))
  (let ((control-id (+ (var-get control-nonce) u1)))
    (map-set access-control
      { control-id: control-id }
      {
        investor-id: investor,
        resource-type: resource-type,
        resource-id: resource,
        access-level: access-level,
        granted-at: stacks-block-height,
        expires-at: expires
      }
    )
    (var-set control-nonce control-id)
    (ok control-id)
  )
)

(define-read-only (get-access-control (control-id uint))
  (map-get? access-control { control-id: control-id })
)
