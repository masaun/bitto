(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map inspections
  { inspection-id: uint }
  {
    project-id: uint,
    inspection-type: (string-ascii 50),
    result: (string-ascii 20),
    inspector: principal,
    conducted-at: uint
  }
)

(define-data-var inspection-nonce uint u0)

(define-public (conduct-inspection (project-id uint) (inspection-type (string-ascii 50)) (result (string-ascii 20)))
  (let ((inspection-id (+ (var-get inspection-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set inspections { inspection-id: inspection-id }
      {
        project-id: project-id,
        inspection-type: inspection-type,
        result: result,
        inspector: tx-sender,
        conducted-at: stacks-block-height
      }
    )
    (var-set inspection-nonce inspection-id)
    (ok inspection-id)
  )
)

(define-read-only (get-inspection (inspection-id uint))
  (ok (map-get? inspections { inspection-id: inspection-id }))
)

(define-read-only (get-inspection-count)
  (ok (var-get inspection-nonce))
)
