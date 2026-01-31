(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))

(define-map facilities
  { facility-id: uint }
  {
    name: (string-ascii 100),
    location: (string-ascii 100),
    clearance-level: uint,
    status: bool,
    registered-at: uint
  }
)

(define-data-var facility-nonce uint u0)

(define-public (register-facility (name (string-ascii 100)) (location (string-ascii 100)) (clearance-level uint))
  (let ((facility-id (+ (var-get facility-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set facilities { facility-id: facility-id }
      {
        name: name,
        location: location,
        clearance-level: clearance-level,
        status: true,
        registered-at: stacks-block-height
      }
    )
    (var-set facility-nonce facility-id)
    (ok facility-id)
  )
)

(define-public (update-facility-status (facility-id uint) (status bool))
  (let ((facility (unwrap! (map-get? facilities { facility-id: facility-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set facilities { facility-id: facility-id } (merge facility { status: status }))
    (ok true)
  )
)

(define-read-only (get-facility (facility-id uint))
  (ok (map-get? facilities { facility-id: facility-id }))
)

(define-read-only (get-facility-count)
  (ok (var-get facility-nonce))
)
