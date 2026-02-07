(define-map demo-day-registrations
  { registration-id: uint }
  {
    demo-day-id: uint,
    startup-id: uint,
    pitch-title: (string-ascii 200),
    registered-at: uint,
    approved: bool
  }
)

(define-data-var registration-nonce uint u0)

(define-public (register-for-demo-day (demo-day uint) (startup uint) (title (string-ascii 200)))
  (let ((registration-id (+ (var-get registration-nonce) u1)))
    (map-set demo-day-registrations
      { registration-id: registration-id }
      {
        demo-day-id: demo-day,
        startup-id: startup,
        pitch-title: title,
        registered-at: stacks-block-height,
        approved: false
      }
    )
    (var-set registration-nonce registration-id)
    (ok registration-id)
  )
)

(define-public (approve-registration (registration-id uint))
  (match (map-get? demo-day-registrations { registration-id: registration-id })
    registration (ok (map-set demo-day-registrations { registration-id: registration-id } (merge registration { approved: true })))
    (err u404)
  )
)

(define-read-only (get-registration (registration-id uint))
  (map-get? demo-day-registrations { registration-id: registration-id })
)
