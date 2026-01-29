(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map biobanks 
  { biobank-id: uint }
  {
    name: (string-ascii 100),
    facility-address: (string-ascii 200),
    custodian: principal,
    license-number: (string-ascii 50),
    active: bool,
    registered-at: uint
  }
)

(define-data-var biobank-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-biobank (biobank-id uint))
  (ok (map-get? biobanks { biobank-id: biobank-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-biobank (name (string-ascii 100)) (facility-address (string-ascii 200)) (custodian principal) (license-number (string-ascii 50)))
  (let
    (
      (biobank-id (var-get biobank-nonce))
    )
    (asserts! (is-none (map-get? biobanks { biobank-id: biobank-id })) ERR_ALREADY_EXISTS)
    (map-set biobanks
      { biobank-id: biobank-id }
      {
        name: name,
        facility-address: facility-address,
        custodian: custodian,
        license-number: license-number,
        active: true,
        registered-at: stacks-block-height
      }
    )
    (var-set biobank-nonce (+ biobank-id u1))
    (ok biobank-id)
  )
)

(define-public (update-biobank-status (biobank-id uint) (active bool))
  (let
    (
      (biobank (unwrap! (map-get? biobanks { biobank-id: biobank-id }) ERR_NOT_FOUND))
    )
    (asserts! (or (is-eq tx-sender (var-get contract-owner)) (is-eq tx-sender (get custodian biobank))) ERR_UNAUTHORIZED)
    (ok (map-set biobanks
      { biobank-id: biobank-id }
      (merge biobank { active: active })
    ))
  )
)
