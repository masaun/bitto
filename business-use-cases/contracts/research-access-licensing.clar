(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_EXPIRED (err u103))

(define-data-var contract-owner principal tx-sender)

(define-map research-licenses
  { license-id: uint }
  {
    dataset-id: uint,
    licensee: principal,
    institution: (string-ascii 100),
    research-purpose: (string-ascii 200),
    granted-at: uint,
    expires-at: uint,
    active: bool
  }
)

(define-data-var license-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-license (license-id uint))
  (ok (map-get? research-licenses { license-id: license-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (grant-license (dataset-id uint) (licensee principal) (institution (string-ascii 100)) (research-purpose (string-ascii 200)) (expires-at uint))
  (let
    (
      (license-id (var-get license-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? research-licenses { license-id: license-id })) ERR_ALREADY_EXISTS)
    (map-set research-licenses
      { license-id: license-id }
      {
        dataset-id: dataset-id,
        licensee: licensee,
        institution: institution,
        research-purpose: research-purpose,
        granted-at: stacks-block-height,
        expires-at: expires-at,
        active: true
      }
    )
    (var-set license-nonce (+ license-id u1))
    (ok license-id)
  )
)

(define-public (revoke-license (license-id uint))
  (let
    (
      (license (unwrap! (map-get? research-licenses { license-id: license-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set research-licenses
      { license-id: license-id }
      (merge license { active: false })
    ))
  )
)
