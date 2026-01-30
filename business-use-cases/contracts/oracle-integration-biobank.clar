(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map oracle-feeds
  { feed-id: uint }
  {
    source-system: (string-ascii 100),
    data-type: (string-ascii 50),
    data-hash: (buff 32),
    oracle-address: principal,
    timestamp: uint,
    verified: bool
  }
)

(define-data-var feed-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-feed (feed-id uint))
  (ok (map-get? oracle-feeds { feed-id: feed-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (submit-data (source-system (string-ascii 100)) (data-type (string-ascii 50)) (data-hash (buff 32)))
  (let
    (
      (feed-id (var-get feed-nonce))
    )
    (asserts! (is-none (map-get? oracle-feeds { feed-id: feed-id })) ERR_ALREADY_EXISTS)
    (map-set oracle-feeds
      { feed-id: feed-id }
      {
        source-system: source-system,
        data-type: data-type,
        data-hash: data-hash,
        oracle-address: tx-sender,
        timestamp: stacks-block-height,
        verified: false
      }
    )
    (var-set feed-nonce (+ feed-id u1))
    (ok feed-id)
  )
)

(define-public (verify-feed (feed-id uint))
  (let
    (
      (feed (unwrap! (map-get? oracle-feeds { feed-id: feed-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set oracle-feeds
      { feed-id: feed-id }
      (merge feed { verified: true })
    ))
  )
)
