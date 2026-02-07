(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map ethical-reviews
  { review-id: uint }
  {
    study-id: uint,
    irb-name: (string-ascii 100),
    approval-number: (string-ascii 50),
    approval-hash: (buff 32),
    approved-by: principal,
    approval-date: uint,
    expiry-date: uint,
    active: bool
  }
)

(define-data-var review-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-review (review-id uint))
  (ok (map-get? ethical-reviews { review-id: review-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (record-approval (study-id uint) (irb-name (string-ascii 100)) (approval-number (string-ascii 50)) (approval-hash (buff 32)) (expiry-date uint))
  (let
    (
      (review-id (var-get review-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? ethical-reviews { review-id: review-id })) ERR_ALREADY_EXISTS)
    (map-set ethical-reviews
      { review-id: review-id }
      {
        study-id: study-id,
        irb-name: irb-name,
        approval-number: approval-number,
        approval-hash: approval-hash,
        approved-by: tx-sender,
        approval-date: stacks-block-height,
        expiry-date: expiry-date,
        active: true
      }
    )
    (var-set review-nonce (+ review-id u1))
    (ok review-id)
  )
)

(define-public (revoke-approval (review-id uint))
  (let
    (
      (review (unwrap! (map-get? ethical-reviews { review-id: review-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set ethical-reviews
      { review-id: review-id }
      (merge review { active: false })
    ))
  )
)
