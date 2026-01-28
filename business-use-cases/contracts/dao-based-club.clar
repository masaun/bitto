(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))
(define-constant err-already-voted (err u104))

(define-map clubs
  {club-id: uint}
  {
    name: (string-ascii 128),
    total-shares: uint,
    treasury: uint,
    active: bool
  }
)

(define-map shareholders
  {club-id: uint, holder: principal}
  {shares: uint, voting-power: uint}
)

(define-map proposals
  {proposal-id: uint}
  {
    club-id: uint,
    proposer: principal,
    title: (string-ascii 256),
    description: (string-ascii 1024),
    votes-for: uint,
    votes-against: uint,
    start-block: uint,
    end-block: uint,
    executed: bool
  }
)

(define-map votes
  {proposal-id: uint, voter: principal}
  {vote: bool, power: uint}
)

(define-data-var club-nonce uint u0)
(define-data-var proposal-nonce uint u0)

(define-read-only (get-club (club-id uint))
  (map-get? clubs {club-id: club-id})
)

(define-read-only (get-shareholder (club-id uint) (holder principal))
  (map-get? shareholders {club-id: club-id, holder: holder})
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals {proposal-id: proposal-id})
)

(define-public (create-club
  (name (string-ascii 128))
  (total-shares uint)
)
  (let ((club-id (var-get club-nonce)))
    (map-set clubs {club-id: club-id}
      {
        name: name,
        total-shares: total-shares,
        treasury: u0,
        active: true
      }
    )
    (map-set shareholders {club-id: club-id, holder: tx-sender}
      {shares: total-shares, voting-power: total-shares}
    )
    (var-set club-nonce (+ club-id u1))
    (ok club-id)
  )
)

(define-public (transfer-shares (club-id uint) (to principal) (shares uint))
  (let ((holder (unwrap! (map-get? shareholders {club-id: club-id, holder: tx-sender}) err-not-found)))
    (asserts! (>= (get shares holder) shares) err-invalid-params)
    (map-set shareholders {club-id: club-id, holder: tx-sender}
      {shares: (- (get shares holder) shares), voting-power: (- (get voting-power holder) shares)}
    )
    (match (map-get? shareholders {club-id: club-id, holder: to})
      recipient
        (map-set shareholders {club-id: club-id, holder: to}
          {shares: (+ (get shares recipient) shares), voting-power: (+ (get voting-power recipient) shares)}
        )
      (map-set shareholders {club-id: club-id, holder: to}
        {shares: shares, voting-power: shares}
      )
    )
    (ok true)
  )
)

(define-public (submit-proposal
  (club-id uint)
  (title (string-ascii 256))
  (description (string-ascii 1024))
  (voting-duration uint)
)
  (let (
    (holder (unwrap! (map-get? shareholders {club-id: club-id, holder: tx-sender}) err-not-found))
    (proposal-id (var-get proposal-nonce))
  )
    (asserts! (> (get shares holder) u0) err-unauthorized)
    (map-set proposals {proposal-id: proposal-id}
      {
        club-id: club-id,
        proposer: tx-sender,
        title: title,
        description: description,
        votes-for: u0,
        votes-against: u0,
        start-block: stacks-block-height,
        end-block: (+ stacks-block-height voting-duration),
        executed: false
      }
    )
    (var-set proposal-nonce (+ proposal-id u1))
    (ok proposal-id)
  )
)

(define-public (cast-vote (proposal-id uint) (vote-for bool))
  (let (
    (proposal (unwrap! (map-get? proposals {proposal-id: proposal-id}) err-not-found))
    (holder (unwrap! (map-get? shareholders {club-id: (get club-id proposal), holder: tx-sender}) err-not-found))
  )
    (asserts! (is-none (map-get? votes {proposal-id: proposal-id, voter: tx-sender})) err-already-voted)
    (asserts! (< stacks-block-height (get end-block proposal)) err-invalid-params)
    (map-set votes {proposal-id: proposal-id, voter: tx-sender}
      {vote: vote-for, power: (get voting-power holder)}
    )
    (if vote-for
      (map-set proposals {proposal-id: proposal-id}
        (merge proposal {votes-for: (+ (get votes-for proposal) (get voting-power holder))})
      )
      (map-set proposals {proposal-id: proposal-id}
        (merge proposal {votes-against: (+ (get votes-against proposal) (get voting-power holder))})
      )
    )
    (ok true)
  )
)
