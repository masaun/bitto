(define-map agreements uint {
  employer: principal,
  union: principal,
  agreement-date: uint,
  expiry-date: uint,
  terms-hash: (buff 32),
  status: (string-ascii 20)
})

(define-data-var agreement-counter uint u0)

(define-read-only (get-agreement (agreement-id uint))
  (map-get? agreements agreement-id))

(define-public (record-agreement (union principal) (duration uint) (terms-hash (buff 32)))
  (let ((new-id (+ (var-get agreement-counter) u1)))
    (map-set agreements new-id {
      employer: tx-sender,
      union: union,
      agreement-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      terms-hash: terms-hash,
      status: "active"
    })
    (var-set agreement-counter new-id)
    (ok new-id)))
