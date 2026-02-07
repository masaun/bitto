(define-map funding-proposals uint {
  proposer: principal,
  project-name: (string-utf8 256),
  requested-amount: uint,
  votes-for: uint,
  votes-against: uint,
  submission-date: uint,
  voting-deadline: uint,
  status: (string-ascii 20)
})

(define-data-var proposal-counter uint u0)

(define-read-only (get-funding-proposal (proposal-id uint))
  (map-get? funding-proposals proposal-id))

(define-public (submit-funding-proposal (project-name (string-utf8 256)) (requested-amount uint) (voting-duration uint))
  (let ((new-id (+ (var-get proposal-counter) u1)))
    (map-set funding-proposals new-id {
      proposer: tx-sender,
      project-name: project-name,
      requested-amount: requested-amount,
      votes-for: u0,
      votes-against: u0,
      submission-date: stacks-block-height,
      voting-deadline: (+ stacks-block-height voting-duration),
      status: "pending"
    })
    (var-set proposal-counter new-id)
    (ok new-id)))

(define-public (vote-on-funding (proposal-id uint) (support bool) (voting-power uint))
  (begin
    (asserts! (is-some (map-get? funding-proposals proposal-id)) (err u1))
    (let ((proposal (unwrap-panic (map-get? funding-proposals proposal-id))))
      (asserts! (< stacks-block-height (get voting-deadline proposal)) (err u2))
      (ok (if support
        (map-set funding-proposals proposal-id (merge proposal { votes-for: (+ (get votes-for proposal) voting-power) }))
        (map-set funding-proposals proposal-id (merge proposal { votes-against: (+ (get votes-against proposal) voting-power) })))))))
