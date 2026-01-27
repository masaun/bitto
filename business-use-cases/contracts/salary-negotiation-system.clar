(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map negotiations
  {negotiation-id: uint}
  {
    player: principal,
    club: principal,
    agent: principal,
    base-salary: uint,
    bonuses: uint,
    years: uint,
    status: (string-ascii 32),
    player-accepted: bool,
    club-accepted: bool
  }
)

(define-map salary-offers
  {offer-id: uint}
  {
    negotiation-id: uint,
    proposer: principal,
    base-salary: uint,
    bonuses: uint,
    years: uint,
    proposed-at: uint
  }
)

(define-data-var negotiation-nonce uint u0)
(define-data-var offer-nonce uint u0)

(define-read-only (get-negotiation (negotiation-id uint))
  (map-get? negotiations {negotiation-id: negotiation-id})
)

(define-read-only (get-offer (offer-id uint))
  (map-get? salary-offers {offer-id: offer-id})
)

(define-public (initiate-negotiation
  (player principal)
  (club principal)
  (agent principal)
  (initial-salary uint)
  (initial-bonuses uint)
  (years uint)
)
  (let ((negotiation-id (var-get negotiation-nonce)))
    (map-set negotiations {negotiation-id: negotiation-id}
      {
        player: player,
        club: club,
        agent: agent,
        base-salary: initial-salary,
        bonuses: initial-bonuses,
        years: years,
        status: "active",
        player-accepted: false,
        club-accepted: false
      }
    )
    (var-set negotiation-nonce (+ negotiation-id u1))
    (ok negotiation-id)
  )
)

(define-public (submit-offer
  (negotiation-id uint)
  (base-salary uint)
  (bonuses uint)
  (years uint)
)
  (let (
    (negotiation (unwrap! (map-get? negotiations {negotiation-id: negotiation-id}) err-not-found))
    (offer-id (var-get offer-nonce))
  )
    (asserts! (or (is-eq tx-sender (get player negotiation)) (is-eq tx-sender (get club negotiation))) err-unauthorized)
    (map-set salary-offers {offer-id: offer-id}
      {
        negotiation-id: negotiation-id,
        proposer: tx-sender,
        base-salary: base-salary,
        bonuses: bonuses,
        years: years,
        proposed-at: stacks-block-height
      }
    )
    (map-set negotiations {negotiation-id: negotiation-id}
      (merge negotiation {base-salary: base-salary, bonuses: bonuses, years: years, player-accepted: false, club-accepted: false})
    )
    (var-set offer-nonce (+ offer-id u1))
    (ok offer-id)
  )
)

(define-public (accept-terms (negotiation-id uint))
  (let ((negotiation (unwrap! (map-get? negotiations {negotiation-id: negotiation-id}) err-not-found)))
    (asserts! (or (is-eq tx-sender (get player negotiation)) (is-eq tx-sender (get club negotiation))) err-unauthorized)
    (if (is-eq tx-sender (get player negotiation))
      (map-set negotiations {negotiation-id: negotiation-id}
        (merge negotiation {player-accepted: true})
      )
      (map-set negotiations {negotiation-id: negotiation-id}
        (merge negotiation {club-accepted: true})
      )
    )
    (let ((updated (unwrap! (map-get? negotiations {negotiation-id: negotiation-id}) err-not-found)))
      (if (and (get player-accepted updated) (get club-accepted updated))
        (begin
          (map-set negotiations {negotiation-id: negotiation-id}
            (merge updated {status: "completed"})
          )
          (ok true)
        )
        (ok false)
      )
    )
  )
)
