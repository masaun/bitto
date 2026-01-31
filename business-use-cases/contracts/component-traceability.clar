(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map components
  { component-id: uint }
  {
    name: (string-ascii 100),
    serial-number: (string-ascii 100),
    manufacturer-id: uint,
    parent-system: uint,
    registered-at: uint
  }
)

(define-data-var component-nonce uint u0)

(define-public (register-component (name (string-ascii 100)) (serial-number (string-ascii 100)) (manufacturer-id uint) (parent-system uint))
  (let ((component-id (+ (var-get component-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set components { component-id: component-id }
      {
        name: name,
        serial-number: serial-number,
        manufacturer-id: manufacturer-id,
        parent-system: parent-system,
        registered-at: stacks-block-height
      }
    )
    (var-set component-nonce component-id)
    (ok component-id)
  )
)

(define-read-only (get-component (component-id uint))
  (ok (map-get? components { component-id: component-id }))
)

(define-read-only (get-component-count)
  (ok (var-get component-nonce))
)
