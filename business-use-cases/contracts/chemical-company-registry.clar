(define-map companies
  { company-id: uint }
  {
    name: (string-ascii 100),
    registration-number: (string-ascii 50),
    country: (string-ascii 50),
    registered-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var company-nonce uint u0)

(define-public (register-company (name (string-ascii 100)) (reg-number (string-ascii 50)) (country (string-ascii 50)))
  (let ((company-id (+ (var-get company-nonce) u1)))
    (map-set companies
      { company-id: company-id }
      {
        name: name,
        registration-number: reg-number,
        country: country,
        registered-at: stacks-block-height,
        status: "active"
      }
    )
    (var-set company-nonce company-id)
    (ok company-id)
  )
)

(define-public (update-status (company-id uint) (new-status (string-ascii 20)))
  (match (map-get? companies { company-id: company-id })
    company (ok (map-set companies { company-id: company-id } (merge company { status: new-status })))
    (err u404)
  )
)

(define-read-only (get-company (company-id uint))
  (map-get? companies { company-id: company-id })
)
