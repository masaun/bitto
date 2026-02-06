(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map material-tracking
  { material-id: uint }
  {
    material-type: (string-ascii 100),
    origin: (string-ascii 100),
    batch-number: (string-ascii 50),
    project-id: uint,
    tracked-at: uint
  }
)

(define-data-var material-nonce uint u0)

(define-public (track-material (material-type (string-ascii 100)) (origin (string-ascii 100)) (batch-number (string-ascii 50)) (project-id uint))
  (let ((material-id (+ (var-get material-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set material-tracking { material-id: material-id }
      {
        material-type: material-type,
        origin: origin,
        batch-number: batch-number,
        project-id: project-id,
        tracked-at: stacks-block-height
      }
    )
    (var-set material-nonce material-id)
    (ok material-id)
  )
)

(define-read-only (get-material (material-id uint))
  (ok (map-get? material-tracking { material-id: material-id }))
)

(define-read-only (get-material-count)
  (ok (var-get material-nonce))
)
