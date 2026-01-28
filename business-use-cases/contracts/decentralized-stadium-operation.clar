(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map stadiums
  {stadium-id: uint}
  {
    name: (string-ascii 128),
    capacity: uint,
    operator: principal,
    total-events: uint,
    revenue-generated: uint
  }
)

(define-map events
  {event-id: uint}
  {
    stadium-id: uint,
    event-type: (string-ascii 64),
    date: uint,
    tickets-sold: uint,
    revenue: uint,
    status: (string-ascii 16)
  }
)

(define-map operational-costs
  {cost-id: uint}
  {
    stadium-id: uint,
    cost-type: (string-ascii 64),
    amount: uint,
    timestamp: uint
  }
)

(define-data-var stadium-nonce uint u0)
(define-data-var event-nonce uint u0)
(define-data-var cost-nonce uint u0)

(define-read-only (get-stadium (stadium-id uint))
  (map-get? stadiums {stadium-id: stadium-id})
)

(define-read-only (get-event (event-id uint))
  (map-get? events {event-id: event-id})
)

(define-public (register-stadium
  (name (string-ascii 128))
  (capacity uint)
)
  (let ((stadium-id (var-get stadium-nonce)))
    (asserts! (> capacity u0) err-invalid-params)
    (map-set stadiums {stadium-id: stadium-id}
      {
        name: name,
        capacity: capacity,
        operator: tx-sender,
        total-events: u0,
        revenue-generated: u0
      }
    )
    (var-set stadium-nonce (+ stadium-id u1))
    (ok stadium-id)
  )
)

(define-public (schedule-event
  (stadium-id uint)
  (event-type (string-ascii 64))
  (date uint)
)
  (let (
    (stadium (unwrap! (map-get? stadiums {stadium-id: stadium-id}) err-not-found))
    (event-id (var-get event-nonce))
  )
    (asserts! (is-eq tx-sender (get operator stadium)) err-unauthorized)
    (map-set events {event-id: event-id}
      {
        stadium-id: stadium-id,
        event-type: event-type,
        date: date,
        tickets-sold: u0,
        revenue: u0,
        status: "scheduled"
      }
    )
    (var-set event-nonce (+ event-id u1))
    (ok event-id)
  )
)

(define-public (record-cost
  (stadium-id uint)
  (cost-type (string-ascii 64))
  (amount uint)
)
  (let (
    (stadium (unwrap! (map-get? stadiums {stadium-id: stadium-id}) err-not-found))
    (cost-id (var-get cost-nonce))
  )
    (asserts! (is-eq tx-sender (get operator stadium)) err-unauthorized)
    (map-set operational-costs {cost-id: cost-id}
      {
        stadium-id: stadium-id,
        cost-type: cost-type,
        amount: amount,
        timestamp: stacks-block-height
      }
    )
    (var-set cost-nonce (+ cost-id u1))
    (ok cost-id)
  )
)
