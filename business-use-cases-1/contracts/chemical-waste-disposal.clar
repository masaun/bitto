(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))

(define-map waste-disposal
  { disposal-id: (string-ascii 50) }
  {
    chemical-id: (string-ascii 50),
    waste-type: (string-ascii 50),
    quantity: uint,
    unit: (string-ascii 20),
    disposal-method: (string-ascii 100),
    disposal-date: uint,
    disposed-by: principal,
    disposal-company: (string-ascii 100),
    certificate-number: (string-ascii 50)
  }
)

(define-public (record-disposal (disposal-id (string-ascii 50)) (chemical-id (string-ascii 50)) (waste-type (string-ascii 50)) (quantity uint) (unit (string-ascii 20)) (disposal-method (string-ascii 100)) (disposal-company (string-ascii 100)) (certificate-number (string-ascii 50)))
  (begin
    (asserts! (is-none (map-get? waste-disposal { disposal-id: disposal-id })) err-already-exists)
    (ok (map-set waste-disposal
      { disposal-id: disposal-id }
      {
        chemical-id: chemical-id,
        waste-type: waste-type,
        quantity: quantity,
        unit: unit,
        disposal-method: disposal-method,
        disposal-date: stacks-block-height,
        disposed-by: tx-sender,
        disposal-company: disposal-company,
        certificate-number: certificate-number
      }
    ))
  )
)

(define-read-only (get-disposal-record (disposal-id (string-ascii 50)))
  (map-get? waste-disposal { disposal-id: disposal-id })
)
