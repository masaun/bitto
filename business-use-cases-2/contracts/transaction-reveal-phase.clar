(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map reveal-phases
  { phase-id: uint }
  {
    commitment: (buff 32),
    revealed-data: (optional (buff 1024)),
    status: (string-ascii 20),
    initiator: principal
  }
)

(define-data-var phase-counter uint u0)

(define-read-only (get-phase (phase-id uint))
  (map-get? reveal-phases { phase-id: phase-id })
)

(define-read-only (get-phase-count)
  (ok (var-get phase-counter))
)

(define-public (initiate-reveal (commitment (buff 32)))
  (let ((phase-id (var-get phase-counter)))
    (map-set reveal-phases
      { phase-id: phase-id }
      {
        commitment: commitment,
        revealed-data: none,
        status: "pending",
        initiator: tx-sender
      }
    )
    (var-set phase-counter (+ phase-id u1))
    (ok phase-id)
  )
)

(define-public (complete-reveal (phase-id uint) (revealed-data (buff 1024)))
  (let ((phase-data (unwrap! (map-get? reveal-phases { phase-id: phase-id }) err-not-found)))
    (asserts! (is-eq (get initiator phase-data) tx-sender) err-owner-only)
    (map-set reveal-phases
      { phase-id: phase-id }
      (merge phase-data { revealed-data: (some revealed-data), status: "completed" })
    )
    (ok true)
  )
)
