(define-map registrations
  { registration-id: uint }
  {
    substance-id: uint,
    jurisdiction: (string-ascii 50),
    registration-number: (string-ascii 100),
    status: (string-ascii 20),
    registered-at: uint,
    expiry: uint
  }
)

(define-data-var registration-nonce uint u0)

(define-public (register-chemical (substance uint) (jurisdiction (string-ascii 50)) (reg-number (string-ascii 100)) (expiry uint))
  (let ((registration-id (+ (var-get registration-nonce) u1)))
    (map-set registrations
      { registration-id: registration-id }
      {
        substance-id: substance,
        jurisdiction: jurisdiction,
        registration-number: reg-number,
        status: "active",
        registered-at: stacks-block-height,
        expiry: expiry
      }
    )
    (var-set registration-nonce registration-id)
    (ok registration-id)
  )
)

(define-read-only (get-registration (registration-id uint))
  (map-get? registrations { registration-id: registration-id })
)
