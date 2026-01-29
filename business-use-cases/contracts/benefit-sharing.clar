(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map benefit-records
  { benefit-id: uint }
  {
    donor-id: uint,
    benefit-type: (string-ascii 50),
    amount: uint,
    description: (string-ascii 200),
    provider: principal,
    created-at: uint,
    claimed: bool
  }
)

(define-data-var benefit-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-benefit (benefit-id uint))
  (ok (map-get? benefit-records { benefit-id: benefit-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (create-benefit (donor-id uint) (benefit-type (string-ascii 50)) (amount uint) (description (string-ascii 200)))
  (let
    (
      (benefit-id (var-get benefit-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? benefit-records { benefit-id: benefit-id })) ERR_ALREADY_EXISTS)
    (map-set benefit-records
      { benefit-id: benefit-id }
      {
        donor-id: donor-id,
        benefit-type: benefit-type,
        amount: amount,
        description: description,
        provider: tx-sender,
        created-at: stacks-block-height,
        claimed: false
      }
    )
    (var-set benefit-nonce (+ benefit-id u1))
    (ok benefit-id)
  )
)

(define-public (mark-claimed (benefit-id uint))
  (let
    (
      (benefit (unwrap! (map-get? benefit-records { benefit-id: benefit-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set benefit-records
      { benefit-id: benefit-id }
      (merge benefit { claimed: true })
    ))
  )
)
