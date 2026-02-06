(define-map emergency-triggers uint {
  trigger-type: (string-ascii 50),
  triggered-by: principal,
  trigger-date: uint,
  severity: (string-ascii 20),
  description: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var trigger-counter uint u0)
(define-data-var emergency-authority principal tx-sender)

(define-read-only (get-emergency-trigger (trigger-id uint))
  (map-get? emergency-triggers trigger-id))

(define-public (activate-emergency-trigger (trigger-type (string-ascii 50)) (severity (string-ascii 20)) (description (string-utf8 512)))
  (let ((new-id (+ (var-get trigger-counter) u1)))
    (asserts! (is-eq tx-sender (var-get emergency-authority)) (err u1))
    (map-set emergency-triggers new-id {
      trigger-type: trigger-type,
      triggered-by: tx-sender,
      trigger-date: stacks-block-height,
      severity: severity,
      description: description,
      status: "activated"
    })
    (var-set trigger-counter new-id)
    (ok new-id)))
