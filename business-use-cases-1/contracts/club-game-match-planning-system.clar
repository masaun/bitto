(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map games
  {game-id: uint}
  {
    home-club: principal,
    away-club: principal,
    venue: (string-ascii 128),
    scheduled-at: uint,
    status: (string-ascii 32),
    home-score: uint,
    away-score: uint,
    officials: (list 5 principal)
  }
)

(define-map club-schedules
  {club: principal, season: uint}
  {games-count: uint, home-games: uint, away-games: uint}
)

(define-data-var game-nonce uint u0)

(define-read-only (get-game (game-id uint))
  (map-get? games {game-id: game-id})
)

(define-read-only (get-club-schedule (club principal) (season uint))
  (map-get? club-schedules {club: club, season: season})
)

(define-public (schedule-game
  (home-club principal)
  (away-club principal)
  (venue (string-ascii 128))
  (scheduled-at uint)
  (officials (list 5 principal))
)
  (let ((game-id (var-get game-nonce)))
    (asserts! (not (is-eq home-club away-club)) err-invalid-params)
    (map-set games {game-id: game-id}
      {
        home-club: home-club,
        away-club: away-club,
        venue: venue,
        scheduled-at: scheduled-at,
        status: "scheduled",
        home-score: u0,
        away-score: u0,
        officials: officials
      }
    )
    (var-set game-nonce (+ game-id u1))
    (ok game-id)
  )
)

(define-public (update-game-status (game-id uint) (status (string-ascii 32)))
  (let ((game (unwrap! (map-get? games {game-id: game-id}) err-not-found)))
    (map-set games {game-id: game-id}
      (merge game {status: status})
    )
    (ok true)
  )
)

(define-public (record-final-score (game-id uint) (home-score uint) (away-score uint))
  (let ((game (unwrap! (map-get? games {game-id: game-id}) err-not-found)))
    (map-set games {game-id: game-id}
      (merge game {home-score: home-score, away-score: away-score, status: "completed"})
    )
    (ok true)
  )
)
