(define-map office-usage
  { usage-id: uint }
  {
    startup-id: uint,
    office-location: (string-ascii 100),
    date: uint,
    hours: uint,
    desk-count: uint,
    recorded-at: uint
  }
)

(define-data-var usage-nonce uint u0)

(define-public (record-office-usage (startup uint) (location (string-ascii 100)) (date uint) (hours uint) (desks uint))
  (let ((usage-id (+ (var-get usage-nonce) u1)))
    (map-set office-usage
      { usage-id: usage-id }
      {
        startup-id: startup,
        office-location: location,
        date: date,
        hours: hours,
        desk-count: desks,
        recorded-at: stacks-block-height
      }
    )
    (var-set usage-nonce usage-id)
    (ok usage-id)
  )
)

(define-read-only (get-office-usage (usage-id uint))
  (map-get? office-usage { usage-id: usage-id })
)
