(define-map carbon-credits uint {
  project-id: uint,
  issuer: principal,
  credits-amount: uint,
  issue-date: uint,
  status: (string-ascii 20)
})

(define-data-var credit-counter uint u0)

(define-read-only (get-carbon-credit (credit-id uint))
  (map-get? carbon-credits credit-id))

(define-public (issue-carbon-credits (project-id uint) (credits-amount uint))
  (let ((new-id (+ (var-get credit-counter) u1)))
    (map-set carbon-credits new-id {
      project-id: project-id,
      issuer: tx-sender,
      credits-amount: credits-amount,
      issue-date: stacks-block-height,
      status: "active"
    })
    (var-set credit-counter new-id)
    (ok new-id)))

(define-public (retire-credits (credit-id uint))
  (begin
    (asserts! (is-some (map-get? carbon-credits credit-id)) (err u2))
    (let ((credit (unwrap-panic (map-get? carbon-credits credit-id))))
      (asserts! (is-eq tx-sender (get issuer credit)) (err u1))
      (ok (map-set carbon-credits credit-id (merge credit { status: "retired" }))))))
