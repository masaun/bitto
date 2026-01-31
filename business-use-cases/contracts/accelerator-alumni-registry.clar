(define-map alumni
  { alumni-id: uint }
  {
    startup-id: uint,
    founder-id: uint,
    program-id: uint,
    graduated-at: uint,
    current-status: (string-ascii 100),
    engagement-level: (string-ascii 20)
  }
)

(define-data-var alumni-nonce uint u0)

(define-public (register-alumni (startup uint) (founder uint) (program uint) (graduated uint))
  (let ((alumni-id (+ (var-get alumni-nonce) u1)))
    (map-set alumni
      { alumni-id: alumni-id }
      {
        startup-id: startup,
        founder-id: founder,
        program-id: program,
        graduated-at: graduated,
        current-status: "active",
        engagement-level: "medium"
      }
    )
    (var-set alumni-nonce alumni-id)
    (ok alumni-id)
  )
)

(define-public (update-alumni-status (alumni-id uint) (status (string-ascii 100)) (engagement (string-ascii 20)))
  (match (map-get? alumni { alumni-id: alumni-id })
    alum (ok (map-set alumni { alumni-id: alumni-id } (merge alum { current-status: status, engagement-level: engagement })))
    (err u404)
  )
)

(define-read-only (get-alumni (alumni-id uint))
  (map-get? alumni { alumni-id: alumni-id })
)
