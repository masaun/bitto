(define-map disputes
  { dispute-id: uint }
  {
    startup-id: uint,
    filed-by: principal,
    dispute-type: (string-ascii 100),
    description: (string-ascii 500),
    filed-at: uint,
    status: (string-ascii 20),
    resolution: (optional (string-ascii 500))
  }
)

(define-data-var dispute-nonce uint u0)

(define-public (file-dispute (startup uint) (dispute-type (string-ascii 100)) (description (string-ascii 500)))
  (let ((dispute-id (+ (var-get dispute-nonce) u1)))
    (map-set disputes
      { dispute-id: dispute-id }
      {
        startup-id: startup,
        filed-by: tx-sender,
        dispute-type: dispute-type,
        description: description,
        filed-at: stacks-block-height,
        status: "open",
        resolution: none
      }
    )
    (var-set dispute-nonce dispute-id)
    (ok dispute-id)
  )
)

(define-public (resolve-dispute (dispute-id uint) (resolution (string-ascii 500)))
  (match (map-get? disputes { dispute-id: dispute-id })
    dispute (ok (map-set disputes { dispute-id: dispute-id } (merge dispute { status: "resolved", resolution: (some resolution) })))
    (err u404)
  )
)

(define-read-only (get-dispute (dispute-id uint))
  (map-get? disputes { dispute-id: dispute-id })
)
