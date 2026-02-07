(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))

(define-map clearances
  { personnel: principal }
  {
    clearance-level: uint,
    issued-at: uint,
    expires-at: uint,
    status: bool
  }
)

(define-public (issue-clearance (personnel principal) (clearance-level uint) (validity-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set clearances { personnel: personnel }
      {
        clearance-level: clearance-level,
        issued-at: stacks-block-height,
        expires-at: (+ stacks-block-height validity-period),
        status: true
      }
    )
    (ok true)
  )
)

(define-public (revoke-clearance (personnel principal))
  (let ((clearance (unwrap! (map-get? clearances { personnel: personnel }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set clearances { personnel: personnel } (merge clearance { status: false }))
    (ok true)
  )
)

(define-read-only (get-clearance (personnel principal))
  (ok (map-get? clearances { personnel: personnel }))
)

(define-read-only (is-clearance-valid (personnel principal))
  (match (map-get? clearances { personnel: personnel })
    clearance (ok (and (get status clearance) (< stacks-block-height (get expires-at clearance))))
    (ok false)
  )
)
