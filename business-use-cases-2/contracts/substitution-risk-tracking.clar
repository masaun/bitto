(define-map substitution-risks uint {
  material-type: (string-ascii 50),
  substitute-material: (string-ascii 50),
  risk-level: uint,
  application: (string-ascii 100),
  analyst: principal,
  timestamp: uint
})

(define-data-var risk-counter uint u0)

(define-read-only (get-substitution-risk (risk-id uint))
  (map-get? substitution-risks risk-id))

(define-public (track-substitution-risk (material-type (string-ascii 50)) (substitute-material (string-ascii 50)) (risk-level uint) (application (string-ascii 100)))
  (let ((new-id (+ (var-get risk-counter) u1)))
    (asserts! (<= risk-level u100) (err u1))
    (map-set substitution-risks new-id {
      material-type: material-type,
      substitute-material: substitute-material,
      risk-level: risk-level,
      application: application,
      analyst: tx-sender,
      timestamp: stacks-block-height
    })
    (var-set risk-counter new-id)
    (ok new-id)))
