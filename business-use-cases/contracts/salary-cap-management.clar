(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map leagues
  {league-id: uint}
  {
    name: (string-ascii 128),
    salary-cap: uint,
    season: uint,
    num-teams: uint
  }
)

(define-map teams
  {team-id: uint}
  {
    league-id: uint,
    name: (string-ascii 128),
    total-salary: uint,
    cap-space: uint
  }
)

(define-map player-contracts
  {contract-id: uint}
  {
    team-id: uint,
    player: principal,
    salary: uint,
    duration: uint,
    start-height: uint
  }
)

(define-data-var league-nonce uint u0)
(define-data-var team-nonce uint u0)
(define-data-var contract-nonce uint u0)

(define-read-only (get-league (league-id uint))
  (map-get? leagues {league-id: league-id})
)

(define-read-only (get-team (team-id uint))
  (map-get? teams {team-id: team-id})
)

(define-read-only (get-player-contract (contract-id uint))
  (map-get? player-contracts {contract-id: contract-id})
)

(define-public (create-league
  (name (string-ascii 128))
  (salary-cap uint)
  (season uint)
)
  (let ((league-id (var-get league-nonce)))
    (asserts! (> salary-cap u0) err-invalid-params)
    (map-set leagues {league-id: league-id}
      {
        name: name,
        salary-cap: salary-cap,
        season: season,
        num-teams: u0
      }
    )
    (var-set league-nonce (+ league-id u1))
    (ok league-id)
  )
)

(define-public (register-team
  (league-id uint)
  (name (string-ascii 128))
)
  (let (
    (league (unwrap! (map-get? leagues {league-id: league-id}) err-not-found))
    (team-id (var-get team-nonce))
  )
    (map-set teams {team-id: team-id}
      {
        league-id: league-id,
        name: name,
        total-salary: u0,
        cap-space: (get salary-cap league)
      }
    )
    (var-set team-nonce (+ team-id u1))
    (ok team-id)
  )
)

(define-public (sign-player
  (team-id uint)
  (player principal)
  (salary uint)
  (duration uint)
)
  (let (
    (team (unwrap! (map-get? teams {team-id: team-id}) err-not-found))
    (contract-id (var-get contract-nonce))
  )
    (asserts! (<= salary (get cap-space team)) err-invalid-params)
    (map-set player-contracts {contract-id: contract-id}
      {
        team-id: team-id,
        player: player,
        salary: salary,
        duration: duration,
        start-height: stacks-block-height
      }
    )
    (map-set teams {team-id: team-id}
      (merge team {
        total-salary: (+ (get total-salary team) salary),
        cap-space: (- (get cap-space team) salary)
      })
    )
    (var-set contract-nonce (+ contract-id u1))
    (ok contract-id)
  )
)
