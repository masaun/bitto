(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map profit-agreements
  {agreement-id: uint}
  {
    player: principal,
    club: principal,
    player-share-bps: uint,
    revenue-sources: (list 10 (string-ascii 64)),
    start-block: uint,
    end-block: uint,
    active: bool
  }
)

(define-map revenue-events
  {event-id: uint}
  {
    agreement-id: uint,
    source: (string-ascii 64),
    amount: uint,
    player-share: uint,
    club-share: uint,
    recorded-at: uint,
    distributed: bool
  }
)

(define-data-var agreement-nonce uint u0)
(define-data-var event-nonce uint u0)

(define-read-only (get-agreement (agreement-id uint))
  (map-get? profit-agreements {agreement-id: agreement-id})
)

(define-read-only (get-revenue-event (event-id uint))
  (map-get? revenue-events {event-id: event-id})
)

(define-public (create-agreement
  (player principal)
  (club principal)
  (player-share-bps uint)
  (revenue-sources (list 10 (string-ascii 64)))
  (duration uint)
)
  (let ((agreement-id (var-get agreement-nonce)))
    (asserts! (<= player-share-bps u10000) err-invalid-params)
    (map-set profit-agreements {agreement-id: agreement-id}
      {
        player: player,
        club: club,
        player-share-bps: player-share-bps,
        revenue-sources: revenue-sources,
        start-block: stacks-block-height,
        end-block: (+ stacks-block-height duration),
        active: true
      }
    )
    (var-set agreement-nonce (+ agreement-id u1))
    (ok agreement-id)
  )
)

(define-public (record-revenue
  (agreement-id uint)
  (source (string-ascii 64))
  (amount uint)
)
  (let (
    (agreement (unwrap! (map-get? profit-agreements {agreement-id: agreement-id}) err-not-found))
    (event-id (var-get event-nonce))
    (player-share (/ (* amount (get player-share-bps agreement)) u10000))
    (club-share (- amount player-share))
  )
    (asserts! (get active agreement) err-invalid-params)
    (map-set revenue-events {event-id: event-id}
      {
        agreement-id: agreement-id,
        source: source,
        amount: amount,
        player-share: player-share,
        club-share: club-share,
        recorded-at: stacks-block-height,
        distributed: false
      }
    )
    (var-set event-nonce (+ event-id u1))
    (ok event-id)
  )
)

(define-public (distribute-revenue (event-id uint))
  (let ((event (unwrap! (map-get? revenue-events {event-id: event-id}) err-not-found)))
    (asserts! (not (get distributed event)) err-invalid-params)
    (map-set revenue-events {event-id: event-id}
      (merge event {distributed: true})
    )
    (ok true)
  )
)
