(define-map data-sharing-agreements uint {
  party-a: principal,
  party-b: principal,
  data-type: (string-ascii 50),
  agreement-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var agreement-counter uint u0)

(define-read-only (get-sharing-agreement (agreement-id uint))
  (map-get? data-sharing-agreements agreement-id))

(define-public (create-sharing-agreement (party-b principal) (data-type (string-ascii 50)) (duration uint))
  (let ((new-id (+ (var-get agreement-counter) u1)))
    (map-set data-sharing-agreements new-id {
      party-a: tx-sender,
      party-b: party-b,
      data-type: data-type,
      agreement-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set agreement-counter new-id)
    (ok new-id)))
