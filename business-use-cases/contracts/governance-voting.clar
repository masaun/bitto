(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_VOTING_CLOSED (err u103))

(define-data-var contract-owner principal tx-sender)

(define-map proposals
  { proposal-id: uint }
  {
    title: (string-ascii 100),
    description: (string-ascii 300),
    proposer: principal,
    proposal-hash: (buff 32),
    created-at: uint,
    voting-ends: uint,
    votes-for: uint,
    votes-against: uint,
    executed: bool
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  { vote: bool, weight: uint }
)

(define-data-var proposal-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-proposal (proposal-id uint))
  (ok (map-get? proposals { proposal-id: proposal-id }))
)

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (ok (map-get? votes { proposal-id: proposal-id, voter: voter }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (create-proposal (title (string-ascii 100)) (description (string-ascii 300)) (proposal-hash (buff 32)) (voting-period uint))
  (let
    (
      (proposal-id (var-get proposal-nonce))
    )
    (asserts! (is-none (map-get? proposals { proposal-id: proposal-id })) ERR_ALREADY_EXISTS)
    (map-set proposals
      { proposal-id: proposal-id }
      {
        title: title,
        description: description,
        proposer: tx-sender,
        proposal-hash: proposal-hash,
        created-at: stacks-block-height,
        voting-ends: (+ stacks-block-height voting-period),
        votes-for: u0,
        votes-against: u0,
        executed: false
      }
    )
    (var-set proposal-nonce (+ proposal-id u1))
    (ok proposal-id)
  )
)

(define-public (cast-vote (proposal-id uint) (vote-for bool) (weight uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) ERR_NOT_FOUND))
    )
    (asserts! (<= stacks-block-height (get voting-ends proposal)) ERR_VOTING_CLOSED)
    (map-set votes
      { proposal-id: proposal-id, voter: tx-sender }
      { vote: vote-for, weight: weight }
    )
    (ok (map-set proposals
      { proposal-id: proposal-id }
      (if vote-for
        (merge proposal { votes-for: (+ (get votes-for proposal) weight) })
        (merge proposal { votes-against: (+ (get votes-against proposal) weight) })
      )
    ))
  )
)
