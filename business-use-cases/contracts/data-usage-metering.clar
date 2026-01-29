(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map usage-events
  { event-id: uint }
  {
    dataset-id: uint,
    user: principal,
    license-id: uint,
    event-type: (string-ascii 50),
    timestamp: uint,
    duration: uint,
    data-volume: uint
  }
)

(define-data-var event-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-usage-event (event-id uint))
  (ok (map-get? usage-events { event-id: event-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (record-usage (dataset-id uint) (license-id uint) (event-type (string-ascii 50)) (duration uint) (data-volume uint))
  (let
    (
      (event-id (var-get event-nonce))
    )
    (asserts! (is-none (map-get? usage-events { event-id: event-id })) ERR_ALREADY_EXISTS)
    (map-set usage-events
      { event-id: event-id }
      {
        dataset-id: dataset-id,
        user: tx-sender,
        license-id: license-id,
        event-type: event-type,
        timestamp: stacks-block-height,
        duration: duration,
        data-volume: data-volume
      }
    )
    (var-set event-nonce (+ event-id u1))
    (ok event-id)
  )
)
