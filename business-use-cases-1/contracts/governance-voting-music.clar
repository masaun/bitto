(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_VOTED (err u102))
(define-constant ERR_VOTING_CLOSED (err u103))

(define-data-var contract-owner principal tx-sender)
(define-data-var proposal-nonce uint u0)

(define-map proposals
  uint
  {
    proposer: principal,
    title: (string-utf8 200),
    description: (string-utf8 500),
    proposal-type: (string-ascii 30),
    start-block: uint,
    end-block: uint,
    votes-for: uint,
    votes-against: uint,
    executed: bool,
    passed: bool
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  {
    vote: bool,
    voting-power: uint,
    timestamp: uint
  }
)

(define-map voting-power
  principal
  uint
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-proposal (proposal-id uint))
  (ok (map-get? proposals proposal-id))
)

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (ok (map-get? votes { proposal-id: proposal-id, voter: voter }))
)

(define-read-only (get-voting-power (voter principal))
  (ok (default-to u0 (map-get? voting-power voter)))
)

(define-read-only (get-proposal-nonce)
  (ok (var-get proposal-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (set-voting-power (voter principal) (power uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set voting-power voter power))
  )
)

(define-public (create-proposal
  (title (string-utf8 200))
  (description (string-utf8 500))
  (proposal-type (string-ascii 30))
  (voting-period-blocks uint)
)
  (let ((proposal-id (+ (var-get proposal-nonce) u1)))
    (map-set proposals proposal-id {
      proposer: tx-sender,
      title: title,
      description: description,
      proposal-type: proposal-type,
      start-block: stacks-block-height,
      end-block: (+ stacks-block-height voting-period-blocks),
      votes-for: u0,
      votes-against: u0,
      executed: false,
      passed: false
    })
    (var-set proposal-nonce proposal-id)
    (ok proposal-id)
  )
)

(define-public (cast-vote (proposal-id uint) (vote-for bool))
  (let 
    (
      (proposal (unwrap! (map-get? proposals proposal-id) ERR_NOT_FOUND))
      (voter-power (default-to u0 (map-get? voting-power tx-sender)))
      (existing-vote (map-get? votes { proposal-id: proposal-id, voter: tx-sender }))
    )
    (asserts! (is-none existing-vote) ERR_ALREADY_VOTED)
    (asserts! (<= stacks-block-height (get end-block proposal)) ERR_VOTING_CLOSED)
    (map-set votes { proposal-id: proposal-id, voter: tx-sender } {
      vote: vote-for,
      voting-power: voter-power,
      timestamp: stacks-block-height
    })
    (if vote-for
      (ok (map-set proposals proposal-id 
        (merge proposal { votes-for: (+ (get votes-for proposal) voter-power) })))
      (ok (map-set proposals proposal-id 
        (merge proposal { votes-against: (+ (get votes-against proposal) voter-power) })))
    )
  )
)

(define-public (execute-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) ERR_NOT_FOUND)))
    (asserts! (> stacks-block-height (get end-block proposal)) ERR_VOTING_CLOSED)
    (asserts! (not (get executed proposal)) ERR_UNAUTHORIZED)
    (let ((passed (> (get votes-for proposal) (get votes-against proposal))))
      (ok (map-set proposals proposal-id (merge proposal { executed: true, passed: passed })))
    )
  )
)
