(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_TRANSFER_FAILED (err u103))

(define-data-var contract-owner principal tx-sender)

(define-map revenue-shares
  { share-id: uint }
  {
    license-id: uint,
    total-amount: uint,
    biobank-share: uint,
    contributor-share: uint,
    platform-share: uint,
    distributed: bool,
    created-at: uint
  }
)

(define-data-var share-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-revenue-share (share-id uint))
  (ok (map-get? revenue-shares { share-id: share-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (record-revenue (license-id uint) (total-amount uint) (biobank-share uint) (contributor-share uint) (platform-share uint))
  (let
    (
      (share-id (var-get share-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? revenue-shares { share-id: share-id })) ERR_ALREADY_EXISTS)
    (map-set revenue-shares
      { share-id: share-id }
      {
        license-id: license-id,
        total-amount: total-amount,
        biobank-share: biobank-share,
        contributor-share: contributor-share,
        platform-share: platform-share,
        distributed: false,
        created-at: stacks-block-height
      }
    )
    (var-set share-nonce (+ share-id u1))
    (ok share-id)
  )
)

(define-public (mark-distributed (share-id uint))
  (let
    (
      (share (unwrap! (map-get? revenue-shares { share-id: share-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set revenue-shares
      { share-id: share-id }
      (merge share { distributed: true })
    ))
  )
)
