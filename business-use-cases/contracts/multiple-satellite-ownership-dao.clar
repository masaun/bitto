(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map dao-members
  {member: principal}
  {voting-power: uint, joined-at: uint, active: bool}
)

(define-map satellite-assets
  {asset-id: uint}
  {
    satellite-id: uint,
    dao-controlled: bool,
    total-shares: uint,
    revenue-generated: uint
  }
)

(define-map proposals
  {proposal-id: uint}
  {
    title: (string-ascii 256),
    proposer: principal,
    votes-for: uint,
    votes-against: uint,
    status: (string-ascii 16),
    created-at: uint,
    ends-at: uint,
    proposal-type: (string-ascii 64)
  }
)

(define-map votes
  {proposal-id: uint, voter: principal}
  {vote: bool, power: uint}
)

(define-data-var proposal-nonce uint u0)
(define-data-var asset-nonce uint u0)
(define-data-var treasury-balance uint u0)

(define-read-only (get-member (member principal))
  (map-get? dao-members {member: member})
)

(define-read-only (get-satellite-asset (asset-id uint))
  (map-get? satellite-assets {asset-id: asset-id})
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals {proposal-id: proposal-id})
)

(define-public (join-dao (voting-power uint))
  (begin
    (map-set dao-members {member: tx-sender}
      {voting-power: voting-power, joined-at: stacks-block-height, active: true}
    )
    (ok true)
  )
)

(define-public (register-satellite-asset (satellite-id uint) (total-shares uint))
  (let ((asset-id (var-get asset-nonce)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set satellite-assets {asset-id: asset-id}
      {
        satellite-id: satellite-id,
        dao-controlled: true,
        total-shares: total-shares,
        revenue-generated: u0
      }
    )
    (var-set asset-nonce (+ asset-id u1))
    (ok asset-id)
  )
)

(define-public (create-proposal
  (title (string-ascii 256))
  (proposal-type (string-ascii 64))
  (duration uint)
)
  (let (
    (member (unwrap! (map-get? dao-members {member: tx-sender}) err-unauthorized))
    (proposal-id (var-get proposal-nonce))
  )
    (asserts! (get active member) err-unauthorized)
    (map-set proposals {proposal-id: proposal-id}
      {
        title: title,
        proposer: tx-sender,
        votes-for: u0,
        votes-against: u0,
        status: "active",
        created-at: stacks-block-height,
        ends-at: (+ stacks-block-height duration),
        proposal-type: proposal-type
      }
    )
    (var-set proposal-nonce (+ proposal-id u1))
    (ok proposal-id)
  )
)

(define-public (vote (proposal-id uint) (vote-for bool))
  (let (
    (proposal (unwrap! (map-get? proposals {proposal-id: proposal-id}) err-not-found))
    (member (unwrap! (map-get? dao-members {member: tx-sender}) err-unauthorized))
  )
    (asserts! (get active member) err-unauthorized)
    (asserts! (is-eq (get status proposal) "active") err-invalid-params)
    (asserts! (< stacks-block-height (get ends-at proposal)) err-invalid-params)
    (map-set votes {proposal-id: proposal-id, voter: tx-sender}
      {vote: vote-for, power: (get voting-power member)}
    )
    (ok (map-set proposals {proposal-id: proposal-id}
      (merge proposal {
        votes-for: (if vote-for (+ (get votes-for proposal) (get voting-power member)) (get votes-for proposal)),
        votes-against: (if vote-for (get votes-against proposal) (+ (get votes-against proposal) (get voting-power member)))
      })
    ))
  )
)
