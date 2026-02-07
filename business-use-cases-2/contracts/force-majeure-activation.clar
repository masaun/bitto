(define-map force-majeure-events uint {
  declaring-party: principal,
  contract-id: uint,
  event-type: (string-ascii 50),
  activation-date: uint,
  description: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var fm-counter uint u0)

(define-read-only (get-force-majeure (fm-id uint))
  (map-get? force-majeure-events fm-id))

(define-public (activate-force-majeure (contract-id uint) (event-type (string-ascii 50)) (description (string-utf8 512)))
  (let ((new-id (+ (var-get fm-counter) u1)))
    (map-set force-majeure-events new-id {
      declaring-party: tx-sender,
      contract-id: contract-id,
      event-type: event-type,
      activation-date: stacks-block-height,
      description: description,
      status: "activated"
    })
    (var-set fm-counter new-id)
    (ok new-id)))
