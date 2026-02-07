(define-map attendance
  { attendance-id: uint }
  {
    workshop-id: uint,
    startup-id: uint,
    attendee: principal,
    attended-at: uint,
    completion-status: bool
  }
)

(define-data-var attendance-nonce uint u0)

(define-public (record-attendance (workshop uint) (startup uint) (completed bool))
  (let ((attendance-id (+ (var-get attendance-nonce) u1)))
    (map-set attendance
      { attendance-id: attendance-id }
      {
        workshop-id: workshop,
        startup-id: startup,
        attendee: tx-sender,
        attended-at: stacks-block-height,
        completion-status: completed
      }
    )
    (var-set attendance-nonce attendance-id)
    (ok attendance-id)
  )
)

(define-read-only (get-attendance (attendance-id uint))
  (map-get? attendance { attendance-id: attendance-id })
)
