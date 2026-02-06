(define-map code-of-conduct
  { violation-id: uint }
  {
    startup-id: uint,
    reported-by: principal,
    violation-type: (string-ascii 100),
    description: (string-ascii 500),
    reported-at: uint,
    status: (string-ascii 20),
    resolution: (optional (string-ascii 500))
  }
)

(define-data-var violation-nonce uint u0)

(define-public (report-violation (startup uint) (violation-type (string-ascii 100)) (description (string-ascii 500)))
  (let ((violation-id (+ (var-get violation-nonce) u1)))
    (map-set code-of-conduct
      { violation-id: violation-id }
      {
        startup-id: startup,
        reported-by: tx-sender,
        violation-type: violation-type,
        description: description,
        reported-at: stacks-block-height,
        status: "open",
        resolution: none
      }
    )
    (var-set violation-nonce violation-id)
    (ok violation-id)
  )
)

(define-public (resolve-violation (violation-id uint) (resolution (string-ascii 500)))
  (match (map-get? code-of-conduct { violation-id: violation-id })
    violation (ok (map-set code-of-conduct { violation-id: violation-id } (merge violation { status: "resolved", resolution: (some resolution) })))
    (err u404)
  )
)

(define-read-only (get-violation (violation-id uint))
  (map-get? code-of-conduct { violation-id: violation-id })
)
