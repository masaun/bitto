(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map collection-attestations
  { attestation-id: uint }
  {
    sample-id: uint,
    biobank-id: uint,
    collector: principal,
    collection-method: (string-ascii 100),
    compliance-standard: (string-ascii 100),
    attestation-hash: (buff 32),
    timestamp: uint,
    verified: bool
  }
)

(define-data-var attestation-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-attestation (attestation-id uint))
  (ok (map-get? collection-attestations { attestation-id: attestation-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (create-attestation (sample-id uint) (biobank-id uint) (collection-method (string-ascii 100)) (compliance-standard (string-ascii 100)) (attestation-hash (buff 32)))
  (let
    (
      (attestation-id (var-get attestation-nonce))
    )
    (asserts! (is-none (map-get? collection-attestations { attestation-id: attestation-id })) ERR_ALREADY_EXISTS)
    (map-set collection-attestations
      { attestation-id: attestation-id }
      {
        sample-id: sample-id,
        biobank-id: biobank-id,
        collector: tx-sender,
        collection-method: collection-method,
        compliance-standard: compliance-standard,
        attestation-hash: attestation-hash,
        timestamp: stacks-block-height,
        verified: false
      }
    )
    (var-set attestation-nonce (+ attestation-id u1))
    (ok attestation-id)
  )
)

(define-public (verify-attestation (attestation-id uint))
  (let
    (
      (attestation (unwrap! (map-get? collection-attestations { attestation-id: attestation-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set collection-attestations
      { attestation-id: attestation-id }
      (merge attestation { verified: true })
    ))
  )
)
