(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map player-scores
  {player-id: principal, season: uint}
  {
    games-played: uint,
    points: uint,
    assists: uint,
    rebounds: uint,
    steals: uint,
    blocks: uint,
    turnovers: uint,
    minutes-played: uint,
    efficiency-rating: uint
  }
)

(define-map game-performances
  {performance-id: uint}
  {
    player: principal,
    game-id: uint,
    season: uint,
    points: uint,
    assists: uint,
    rebounds: uint,
    steals: uint,
    blocks: uint,
    turnovers: uint,
    minutes: uint
  }
)

(define-data-var performance-nonce uint u0)

(define-read-only (get-player-scores (player-id principal) (season uint))
  (map-get? player-scores {player-id: player-id, season: season})
)

(define-read-only (get-performance (performance-id uint))
  (map-get? game-performances {performance-id: performance-id})
)

(define-private (calculate-efficiency
  (points uint) (assists uint) (rebounds uint)
  (steals uint) (blocks uint) (turnovers uint)
)
  (+ points (+ assists (+ rebounds (+ steals (+ blocks (- u0 turnovers))))))
)

(define-public (record-performance
  (player principal)
  (game-id uint)
  (season uint)
  (points uint)
  (assists uint)
  (rebounds uint)
  (steals uint)
  (blocks uint)
  (turnovers uint)
  (minutes uint)
)
  (let ((performance-id (var-get performance-nonce)))
    (map-set game-performances {performance-id: performance-id}
      {
        player: player,
        game-id: game-id,
        season: season,
        points: points,
        assists: assists,
        rebounds: rebounds,
        steals: steals,
        blocks: blocks,
        turnovers: turnovers,
        minutes: minutes
      }
    )
    (match (map-get? player-scores {player-id: player, season: season})
      existing-score
        (let (
          (new-games (+ (get games-played existing-score) u1))
          (new-points (+ (get points existing-score) points))
          (new-assists (+ (get assists existing-score) assists))
          (new-rebounds (+ (get rebounds existing-score) rebounds))
          (new-steals (+ (get steals existing-score) steals))
          (new-blocks (+ (get blocks existing-score) blocks))
          (new-turnovers (+ (get turnovers existing-score) turnovers))
          (new-minutes (+ (get minutes-played existing-score) minutes))
        )
          (map-set player-scores {player-id: player, season: season}
            {
              games-played: new-games,
              points: new-points,
              assists: new-assists,
              rebounds: new-rebounds,
              steals: new-steals,
              blocks: new-blocks,
              turnovers: new-turnovers,
              minutes-played: new-minutes,
              efficiency-rating: (calculate-efficiency new-points new-assists new-rebounds new-steals new-blocks new-turnovers)
            }
          )
        )
      (map-set player-scores {player-id: player, season: season}
        {
          games-played: u1,
          points: points,
          assists: assists,
          rebounds: rebounds,
          steals: steals,
          blocks: blocks,
          turnovers: turnovers,
          minutes-played: minutes,
          efficiency-rating: (calculate-efficiency points assists rebounds steals blocks turnovers)
        }
      )
    )
    (var-set performance-nonce (+ performance-id u1))
    (ok performance-id)
  )
)
