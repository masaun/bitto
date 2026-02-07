(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map drafts
  {draft-id: uint}
  {
    season: uint,
    total-picks: uint,
    current-pick: uint,
    status: (string-ascii 16)
  }
)

(define-map draft-picks
  {pick-id: uint}
  {
    draft-id: uint,
    team-id: uint,
    pick-number: uint,
    player: (optional principal),
    timestamp: (optional uint)
  }
)

(define-map eligible-players
  {player: principal}
  {
    name: (string-ascii 128),
    position: (string-ascii 32),
    rating: uint,
    drafted: bool
  }
)

(define-data-var draft-nonce uint u0)
(define-data-var pick-nonce uint u0)

(define-read-only (get-draft (draft-id uint))
  (map-get? drafts {draft-id: draft-id})
)

(define-read-only (get-pick (pick-id uint))
  (map-get? draft-picks {pick-id: pick-id})
)

(define-read-only (get-player-status (player principal))
  (map-get? eligible-players {player: player})
)

(define-public (create-draft (season uint) (total-picks uint))
  (let ((draft-id (var-get draft-nonce)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> total-picks u0) err-invalid-params)
    (map-set drafts {draft-id: draft-id}
      {
        season: season,
        total-picks: total-picks,
        current-pick: u0,
        status: "pending"
      }
    )
    (var-set draft-nonce (+ draft-id u1))
    (ok draft-id)
  )
)

(define-public (register-eligible-player
  (player principal)
  (name (string-ascii 128))
  (position (string-ascii 32))
  (rating uint)
)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set eligible-players {player: player}
      {
        name: name,
        position: position,
        rating: rating,
        drafted: false
      }
    ))
  )
)

(define-public (make-pick
  (draft-id uint)
  (team-id uint)
  (player principal)
)
  (let (
    (draft (unwrap! (map-get? drafts {draft-id: draft-id}) err-not-found))
    (player-status (unwrap! (map-get? eligible-players {player: player}) err-not-found))
    (pick-id (var-get pick-nonce))
  )
    (asserts! (not (get drafted player-status)) err-invalid-params)
    (asserts! (is-eq (get status draft) "active") err-invalid-params)
    (map-set draft-picks {pick-id: pick-id}
      {
        draft-id: draft-id,
        team-id: team-id,
        pick-number: (+ (get current-pick draft) u1),
        player: (some player),
        timestamp: (some stacks-block-height)
      }
    )
    (map-set eligible-players {player: player}
      (merge player-status {drafted: true})
    )
    (map-set drafts {draft-id: draft-id}
      (merge draft {current-pick: (+ (get current-pick draft) u1)})
    )
    (var-set pick-nonce (+ pick-id u1))
    (ok pick-id)
  )
)
