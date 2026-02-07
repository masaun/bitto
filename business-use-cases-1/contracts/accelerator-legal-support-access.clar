(define-map legal-support
  { support-id: uint }
  {
    startup-id: uint,
    service-type: (string-ascii 100),
    provider: (string-ascii 100),
    granted-at: uint,
    hours-allocated: uint,
    hours-used: uint
  }
)

(define-data-var support-nonce uint u0)

(define-public (grant-legal-support (startup uint) (service-type (string-ascii 100)) (provider (string-ascii 100)) (hours uint))
  (let ((support-id (+ (var-get support-nonce) u1)))
    (map-set legal-support
      { support-id: support-id }
      {
        startup-id: startup,
        service-type: service-type,
        provider: provider,
        granted-at: stacks-block-height,
        hours-allocated: hours,
        hours-used: u0
      }
    )
    (var-set support-nonce support-id)
    (ok support-id)
  )
)

(define-read-only (get-legal-support (support-id uint))
  (map-get? legal-support { support-id: support-id })
)
