(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map leagues
  {league-id: uint}
  {
    name: (string-ascii 128),
    founder: principal,
    season-start: uint,
    season-end: uint,
    teams-count: uint,
    active: bool
  }
)

(define-map teams
  {team-id: uint}
  {
    league-id: uint,
    owner: principal,
    name: (string-ascii 128),
    home-venue: (string-ascii 128),
    wins: uint,
    losses: uint,
    active: bool
  }
)

(define-map matches
  {match-id: uint}
  {
    league-id: uint,
    home-team: uint,
    away-team: uint,
    scheduled-at: uint,
    home-score: uint,
    away-score: uint,
    completed: bool
  }
)

(define-data-var league-nonce uint u0)
(define-data-var team-nonce uint u0)
(define-data-var match-nonce uint u0)

(define-read-only (get-league (league-id uint))
  (map-get? leagues {league-id: league-id})
)

(define-read-only (get-team (team-id uint))
  (map-get? teams {team-id: team-id})
)

(define-read-only (get-match (match-id uint))
  (map-get? matches {match-id: match-id})
)

(define-public (create-league
  (name (string-ascii 128))
  (season-start uint)
  (season-end uint)
)
  (let ((league-id (var-get league-nonce)))
    (asserts! (> season-end season-start) err-invalid-params)
    (map-set leagues {league-id: league-id}
      {
        name: name,
        founder: tx-sender,
        season-start: season-start,
        season-end: season-end,
        teams-count: u0,
        active: true
      }
    )
    (var-set league-nonce (+ league-id u1))
    (ok league-id)
  )
)

(define-public (register-team
  (league-id uint)
  (name (string-ascii 128))
  (home-venue (string-ascii 128))
)
  (let (
    (league (unwrap! (map-get? leagues {league-id: league-id}) err-not-found))
    (team-id (var-get team-nonce))
  )
    (asserts! (get active league) err-invalid-params)
    (map-set teams {team-id: team-id}
      {
        league-id: league-id,
        owner: tx-sender,
        name: name,
        home-venue: home-venue,
        wins: u0,
        losses: u0,
        active: true
      }
    )
    (map-set leagues {league-id: league-id}
      (merge league {teams-count: (+ (get teams-count league) u1)})
    )
    (var-set team-nonce (+ team-id u1))
    (ok team-id)
  )
)

(define-public (schedule-match
  (league-id uint)
  (home-team uint)
  (away-team uint)
  (scheduled-at uint)
)
  (let (
    (league (unwrap! (map-get? leagues {league-id: league-id}) err-not-found))
    (match-id (var-get match-nonce))
  )
    (asserts! (is-eq tx-sender (get founder league)) err-unauthorized)
    (asserts! (not (is-eq home-team away-team)) err-invalid-params)
    (map-set matches {match-id: match-id}
      {
        league-id: league-id,
        home-team: home-team,
        away-team: away-team,
        scheduled-at: scheduled-at,
        home-score: u0,
        away-score: u0,
        completed: false
      }
    )
    (var-set match-nonce (+ match-id u1))
    (ok match-id)
  )
)

(define-public (record-result
  (match-id uint)
  (home-score uint)
  (away-score uint)
)
  (let (
    (match (unwrap! (map-get? matches {match-id: match-id}) err-not-found))
    (league (unwrap! (map-get? leagues {league-id: (get league-id match)}) err-not-found))
    (home-team (unwrap! (map-get? teams {team-id: (get home-team match)}) err-not-found))
    (away-team (unwrap! (map-get? teams {team-id: (get away-team match)}) err-not-found))
  )
    (asserts! (is-eq tx-sender (get founder league)) err-unauthorized)
    (asserts! (not (get completed match)) err-invalid-params)
    (map-set matches {match-id: match-id}
      (merge match {home-score: home-score, away-score: away-score, completed: true})
    )
    (if (> home-score away-score)
      (begin
        (map-set teams {team-id: (get home-team match)}
          (merge home-team {wins: (+ (get wins home-team) u1)})
        )
        (map-set teams {team-id: (get away-team match)}
          (merge away-team {losses: (+ (get losses away-team) u1)})
        )
      )
      (begin
        (map-set teams {team-id: (get away-team match)}
          (merge away-team {wins: (+ (get wins away-team) u1)})
        )
        (map-set teams {team-id: (get home-team match)}
          (merge home-team {losses: (+ (get losses home-team) u1)})
        )
      )
    )
    (ok true)
  )
)
