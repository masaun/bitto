(define-map financing-projects uint {
  project-owner: principal,
  project-name: (string-utf8 256),
  financing-amount: uint,
  interest-rate: uint,
  start-date: uint,
  end-date: uint,
  status: (string-ascii 20)
})

(define-data-var project-counter uint u0)

(define-read-only (get-financing-project (project-id uint))
  (map-get? financing-projects project-id))

(define-public (create-financing (project-name (string-utf8 256)) (financing-amount uint) (interest-rate uint) (duration uint))
  (let ((new-id (+ (var-get project-counter) u1)))
    (map-set financing-projects new-id {
      project-owner: tx-sender,
      project-name: project-name,
      financing-amount: financing-amount,
      interest-rate: interest-rate,
      start-date: stacks-block-height,
      end-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set project-counter new-id)
    (ok new-id)))
