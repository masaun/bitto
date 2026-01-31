(define-map facilities
  { facility-id: uint }
  {
    company-id: uint,
    name: (string-ascii 100),
    location: (string-ascii 100),
    facility-type: (string-ascii 50),
    capacity: uint,
    registered-at: uint
  }
)

(define-data-var facility-nonce uint u0)

(define-public (register-facility (company-id uint) (name (string-ascii 100)) (location (string-ascii 100)) (facility-type (string-ascii 50)) (capacity uint))
  (let ((facility-id (+ (var-get facility-nonce) u1)))
    (map-set facilities
      { facility-id: facility-id }
      {
        company-id: company-id,
        name: name,
        location: location,
        facility-type: facility-type,
        capacity: capacity,
        registered-at: stacks-block-height
      }
    )
    (var-set facility-nonce facility-id)
    (ok facility-id)
  )
)

(define-read-only (get-facility (facility-id uint))
  (map-get? facilities { facility-id: facility-id })
)
