(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map consents
  { consent-id: uint }
  {
    donor-id: uint,
    biobank-id: uint,
    consent-hash: (buff 32),
    scope: (string-ascii 200),
    allow-commercial: bool,
    allow-genetic-research: bool,
    allow-data-sharing: bool,
    valid-until: uint,
    created-at: uint,
    revoked: bool
  }
)

(define-data-var consent-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-consent (consent-id uint))
  (ok (map-get? consents { consent-id: consent-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (record-consent (donor-id uint) (biobank-id uint) (consent-hash (buff 32)) (scope (string-ascii 200)) (allow-commercial bool) (allow-genetic-research bool) (allow-data-sharing bool) (valid-until uint))
  (let
    (
      (consent-id (var-get consent-nonce))
    )
    (asserts! (is-none (map-get? consents { consent-id: consent-id })) ERR_ALREADY_EXISTS)
    (map-set consents
      { consent-id: consent-id }
      {
        donor-id: donor-id,
        biobank-id: biobank-id,
        consent-hash: consent-hash,
        scope: scope,
        allow-commercial: allow-commercial,
        allow-genetic-research: allow-genetic-research,
        allow-data-sharing: allow-data-sharing,
        valid-until: valid-until,
        created-at: stacks-block-height,
        revoked: false
      }
    )
    (var-set consent-nonce (+ consent-id u1))
    (ok consent-id)
  )
)

(define-public (revoke-consent (consent-id uint))
  (let
    (
      (consent (unwrap! (map-get? consents { consent-id: consent-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set consents
      { consent-id: consent-id }
      (merge consent { revoked: true })
    ))
  )
)
