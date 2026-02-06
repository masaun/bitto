(define-map dao-members principal {
  join-date: uint,
  voting-power: uint,
  status: (string-ascii 20)
})

(define-map proposals uint {
  proposer: principal,
  proposal-type: (string-ascii 50),
  description: (string-utf8 512),
  votes-for: uint,
  votes-against: uint,
  submission-date: uint,
  voting-deadline: uint,
  status: (string-ascii 20)
})

(define-data-var proposal-counter uint u0)
(define-data-var dao-admin principal tx-sender)

(define-read-only (get-member (member principal))
  (map-get? dao-members member))

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id))

(define-public (join-dao)
  (begin
    (asserts! (is-none (map-get? dao-members tx-sender)) (err u1))
    (ok (map-set dao-members tx-sender {
      join-date: stacks-block-height,
      voting-power: u1,
      status: "active"
    }))))

(define-public (submit-proposal (proposal-type (string-ascii 50)) (description (string-utf8 512)) (voting-duration uint))
  (let ((new-id (+ (var-get proposal-counter) u1)))
    (asserts! (is-some (map-get? dao-members tx-sender)) (err u1))
    (map-set proposals new-id {
      proposer: tx-sender,
      proposal-type: proposal-type,
      description: description,
      votes-for: u0,
      votes-against: u0,
      submission-date: stacks-block-height,
      voting-deadline: (+ stacks-block-height voting-duration),
      status: "active"
    })
    (var-set proposal-counter new-id)
    (ok new-id)))

(define-public (vote (proposal-id uint) (support bool))
  (begin
    (asserts! (is-some (map-get? dao-members tx-sender)) (err u1))
    (asserts! (is-some (map-get? proposals proposal-id)) (err u2))
    (let (
      (proposal (unwrap-panic (map-get? proposals proposal-id)))
      (member (unwrap-panic (map-get? dao-members tx-sender)))
    )
      (asserts! (< stacks-block-height (get voting-deadline proposal)) (err u3))
      (ok (if support
        (map-set proposals proposal-id (merge proposal { votes-for: (+ (get votes-for proposal) (get voting-power member)) }))
        (map-set proposals proposal-id (merge proposal { votes-against: (+ (get votes-against proposal) (get voting-power member)) })))))))
