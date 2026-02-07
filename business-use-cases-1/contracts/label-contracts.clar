(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var contract-nonce uint u0)

(define-map label-agreements
  uint
  {
    artist: principal,
    label: principal,
    royalty-percentage: uint,
    advance-amount: uint,
    term-blocks: uint,
    start-block: uint,
    active: bool
  }
)

(define-map artist-label-map
  { artist: principal, label: principal }
  uint
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-agreement (agreement-id uint))
  (ok (map-get? label-agreements agreement-id))
)

(define-read-only (get-artist-label-agreement (artist principal) (label principal))
  (ok (map-get? artist-label-map { artist: artist, label: label }))
)

(define-read-only (get-contract-nonce)
  (ok (var-get contract-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (create-agreement
  (artist principal)
  (royalty-percentage uint)
  (advance-amount uint)
  (term-blocks uint)
)
  (let 
    (
      (agreement-id (+ (var-get contract-nonce) u1))
      (existing (map-get? artist-label-map { artist: artist, label: tx-sender }))
    )
    (asserts! (is-none existing) ERR_ALREADY_EXISTS)
    (map-set label-agreements agreement-id {
      artist: artist,
      label: tx-sender,
      royalty-percentage: royalty-percentage,
      advance-amount: advance-amount,
      term-blocks: term-blocks,
      start-block: stacks-block-height,
      active: true
    })
    (map-set artist-label-map { artist: artist, label: tx-sender } agreement-id)
    (var-set contract-nonce agreement-id)
    (ok agreement-id)
  )
)

(define-public (terminate-agreement (agreement-id uint))
  (let ((agreement (unwrap! (map-get? label-agreements agreement-id) ERR_NOT_FOUND)))
    (asserts! (or 
      (is-eq tx-sender (get artist agreement))
      (is-eq tx-sender (get label agreement))
    ) ERR_UNAUTHORIZED)
    (ok (map-set label-agreements agreement-id (merge agreement { active: false })))
  )
)
