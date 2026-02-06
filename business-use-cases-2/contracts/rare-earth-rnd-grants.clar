(define-map grants uint {
  recipient: principal,
  project-name: (string-utf8 256),
  grant-amount: uint,
  grant-date: uint,
  completion-deadline: uint,
  status: (string-ascii 20)
})

(define-data-var grant-counter uint u0)
(define-data-var grant-authority principal tx-sender)

(define-read-only (get-grant (grant-id uint))
  (map-get? grants grant-id))

(define-public (award-grant (recipient principal) (project-name (string-utf8 256)) (grant-amount uint) (duration uint))
  (let ((new-id (+ (var-get grant-counter) u1)))
    (asserts! (is-eq tx-sender (var-get grant-authority)) (err u1))
    (map-set grants new-id {
      recipient: recipient,
      project-name: project-name,
      grant-amount: grant-amount,
      grant-date: stacks-block-height,
      completion-deadline: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set grant-counter new-id)
    (ok new-id)))
