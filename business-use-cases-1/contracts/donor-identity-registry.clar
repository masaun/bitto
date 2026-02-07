(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map donors
  { donor-id: uint }
  {
    pseudonym-hash: (buff 32),
    biobank-id: uint,
    age-range: (string-ascii 20),
    gender: (string-ascii 10),
    ethnicity: (string-ascii 50),
    registered-at: uint,
    active: bool
  }
)

(define-data-var donor-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-donor (donor-id uint))
  (ok (map-get? donors { donor-id: donor-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-donor (pseudonym-hash (buff 32)) (biobank-id uint) (age-range (string-ascii 20)) (gender (string-ascii 10)) (ethnicity (string-ascii 50)))
  (let
    (
      (donor-id (var-get donor-nonce))
    )
    (asserts! (is-none (map-get? donors { donor-id: donor-id })) ERR_ALREADY_EXISTS)
    (map-set donors
      { donor-id: donor-id }
      {
        pseudonym-hash: pseudonym-hash,
        biobank-id: biobank-id,
        age-range: age-range,
        gender: gender,
        ethnicity: ethnicity,
        registered-at: stacks-block-height,
        active: true
      }
    )
    (var-set donor-nonce (+ donor-id u1))
    (ok donor-id)
  )
)

(define-public (deactivate-donor (donor-id uint))
  (let
    (
      (donor (unwrap! (map-get? donors { donor-id: donor-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set donors
      { donor-id: donor-id }
      (merge donor { active: false })
    ))
  )
)
