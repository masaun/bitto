(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_PARAMS (err u103))

(define-data-var governance-admin principal tx-sender)
(define-data-var next-proposal-id uint u1)

(define-map proposals
    uint
    {
        proposer: principal,
        description: (string-ascii 256),
        votes-for: uint,
        votes-against: uint,
        created-at: uint,
        expires-at: uint,
        status: (string-ascii 10)
    }
)

(define-map votes
    { proposal-id: uint, voter: principal }
    bool
)

(define-read-only (get-proposal (proposal-id uint))
    (map-get? proposals proposal-id)
)

(define-public (create-proposal (description (string-ascii 256)) (duration uint))
    (let
        (
            (proposal-id (var-get next-proposal-id))
        )
        (map-set proposals proposal-id {
            proposer: tx-sender,
            description: description,
            votes-for: u0,
            votes-against: u0,
            created-at: stacks-block-height,
            expires-at: (+ stacks-block-height duration),
            status: "active"
        })
        (var-set next-proposal-id (+ proposal-id u1))
        (ok proposal-id)
    )
)

(define-public (vote (proposal-id uint) (support bool))
    (let
        (
            (proposal (unwrap! (map-get? proposals proposal-id) (err u101)))
            (has-voted (default-to false (map-get? votes { proposal-id: proposal-id, voter: tx-sender })))
        )
        (asserts! (not has-voted) ERR_INVALID_PARAMS)
        (asserts! (<= stacks-block-height (get expires-at proposal)) ERR_INVALID_PARAMS)
        (map-set votes { proposal-id: proposal-id, voter: tx-sender } true)
        (if support
            (map-set proposals proposal-id (merge proposal { votes-for: (+ (get votes-for proposal) u1) }))
            (map-set proposals proposal-id (merge proposal { votes-against: (+ (get votes-against proposal) u1) }))
        )
        (ok true)
    )
)

(define-public (set-governance-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get governance-admin)) ERR_UNAUTHORIZED)
        (var-set governance-admin new-admin)
        (ok true)
    )
)
