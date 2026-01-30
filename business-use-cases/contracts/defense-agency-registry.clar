(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))

(define-map agencies 
  { agency-id: uint } 
  { 
    name: (string-ascii 100),
    agency-type: (string-ascii 50),
    country: (string-ascii 50),
    clearance-level: uint,
    status: bool,
    registered-at: uint
  }
)

(define-data-var agency-nonce uint u0)

(define-public (register-agency (name (string-ascii 100)) (agency-type (string-ascii 50)) (country (string-ascii 50)) (clearance-level uint))
  (let ((agency-id (+ (var-get agency-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (is-none (map-get? agencies { agency-id: agency-id })) err-already-exists)
    (map-set agencies { agency-id: agency-id }
      { 
        name: name,
        agency-type: agency-type,
        country: country,
        clearance-level: clearance-level,
        status: true,
        registered-at: stacks-block-height
      }
    )
    (var-set agency-nonce agency-id)
    (ok agency-id)
  )
)

(define-public (update-agency-status (agency-id uint) (status bool))
  (let ((agency (unwrap! (map-get? agencies { agency-id: agency-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set agencies { agency-id: agency-id } (merge agency { status: status }))
    (ok true)
  )
)

(define-read-only (get-agency (agency-id uint))
  (ok (map-get? agencies { agency-id: agency-id }))
)

(define-read-only (get-agency-count)
  (ok (var-get agency-nonce))
)
