(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map sponsorship-deals
  {deal-id: uint}
  {
    sponsor: principal,
    league-id: uint,
    amount: uint,
    start-block: uint,
    end-block: uint,
    category: (string-ascii 64),
    active: bool
  }
)

(define-map league-sponsors
  {league-id: uint, sponsor: principal}
  {total-contributed: uint, deals-count: uint}
)

(define-data-var deal-nonce uint u0)

(define-read-only (get-deal (deal-id uint))
  (map-get? sponsorship-deals {deal-id: deal-id})
)

(define-read-only (get-league-sponsor (league-id uint) (sponsor principal))
  (map-get? league-sponsors {league-id: league-id, sponsor: sponsor})
)

(define-public (create-sponsorship
  (league-id uint)
  (amount uint)
  (duration uint)
  (category (string-ascii 64))
)
  (let ((deal-id (var-get deal-nonce)))
    (map-set sponsorship-deals {deal-id: deal-id}
      {
        sponsor: tx-sender,
        league-id: league-id,
        amount: amount,
        start-block: stacks-block-height,
        end-block: (+ stacks-block-height duration),
        category: category,
        active: true
      }
    )
    (match (map-get? league-sponsors {league-id: league-id, sponsor: tx-sender})
      existing-sponsor
        (map-set league-sponsors {league-id: league-id, sponsor: tx-sender}
          {
            total-contributed: (+ (get total-contributed existing-sponsor) amount),
            deals-count: (+ (get deals-count existing-sponsor) u1)
          }
        )
      (map-set league-sponsors {league-id: league-id, sponsor: tx-sender}
        {total-contributed: amount, deals-count: u1}
      )
    )
    (var-set deal-nonce (+ deal-id u1))
    (ok deal-id)
  )
)

(define-public (renew-sponsorship (deal-id uint) (additional-duration uint))
  (let ((deal (unwrap! (map-get? sponsorship-deals {deal-id: deal-id}) err-not-found)))
    (asserts! (is-eq tx-sender (get sponsor deal)) err-unauthorized)
    (map-set sponsorship-deals {deal-id: deal-id}
      (merge deal {end-block: (+ (get end-block deal) additional-duration)})
    )
    (ok true)
  )
)
