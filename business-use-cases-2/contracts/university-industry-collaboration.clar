(define-map collaborations uint {
  university: principal,
  industry-partner: principal,
  project-name: (string-utf8 256),
  start-date: uint,
  funding-amount: uint,
  ip-sharing-terms: (string-ascii 100),
  status: (string-ascii 20)
})

(define-data-var collab-counter uint u0)

(define-read-only (get-collaboration (collab-id uint))
  (map-get? collaborations collab-id))

(define-public (create-collaboration (industry-partner principal) (project-name (string-utf8 256)) (funding-amount uint) (ip-sharing-terms (string-ascii 100)))
  (let ((new-id (+ (var-get collab-counter) u1)))
    (map-set collaborations new-id {
      university: tx-sender,
      industry-partner: industry-partner,
      project-name: project-name,
      start-date: stacks-block-height,
      funding-amount: funding-amount,
      ip-sharing-terms: ip-sharing-terms,
      status: "active"
    })
    (var-set collab-counter new-id)
    (ok new-id)))
