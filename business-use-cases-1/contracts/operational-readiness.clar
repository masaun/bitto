(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map readiness-status
  { unit-id: uint }
  {
    readiness-level: uint,
    available: bool,
    last-assessment: uint
  }
)

(define-public (update-readiness (unit-id uint) (readiness-level uint) (available bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set readiness-status { unit-id: unit-id }
      {
        readiness-level: readiness-level,
        available: available,
        last-assessment: stacks-block-height
      }
    )
    (ok true)
  )
)

(define-read-only (get-readiness (unit-id uint))
  (ok (map-get? readiness-status { unit-id: unit-id }))
)
