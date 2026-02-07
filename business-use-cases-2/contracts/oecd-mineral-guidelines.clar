(define-map oecd-compliance uint {
  entity: principal,
  guideline: (string-ascii 100),
  compliance-status: bool,
  assessment-date: uint,
  assessor: principal
})

(define-data-var compliance-counter uint u0)

(define-read-only (get-oecd-compliance (compliance-id uint))
  (map-get? oecd-compliance compliance-id))

(define-public (assess-oecd-compliance (entity principal) (guideline (string-ascii 100)) (compliance-status bool))
  (let ((new-id (+ (var-get compliance-counter) u1)))
    (map-set oecd-compliance new-id {
      entity: entity,
      guideline: guideline,
      compliance-status: compliance-status,
      assessment-date: stacks-block-height,
      assessor: tx-sender
    })
    (var-set compliance-counter new-id)
    (ok new-id)))
