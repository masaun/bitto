(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map clinical-metadata
  { metadata-id: uint }
  {
    donor-id: uint,
    sample-id: uint,
    diagnosis: (string-ascii 100),
    phenotype: (string-ascii 200),
    treatment-history: (buff 32),
    metadata-hash: (buff 32),
    created-at: uint,
    updated-at: uint
  }
)

(define-data-var metadata-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-metadata (metadata-id uint))
  (ok (map-get? clinical-metadata { metadata-id: metadata-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-metadata (donor-id uint) (sample-id uint) (diagnosis (string-ascii 100)) (phenotype (string-ascii 200)) (treatment-history (buff 32)) (metadata-hash (buff 32)))
  (let
    (
      (metadata-id (var-get metadata-nonce))
    )
    (asserts! (is-none (map-get? clinical-metadata { metadata-id: metadata-id })) ERR_ALREADY_EXISTS)
    (map-set clinical-metadata
      { metadata-id: metadata-id }
      {
        donor-id: donor-id,
        sample-id: sample-id,
        diagnosis: diagnosis,
        phenotype: phenotype,
        treatment-history: treatment-history,
        metadata-hash: metadata-hash,
        created-at: stacks-block-height,
        updated-at: stacks-block-height
      }
    )
    (var-set metadata-nonce (+ metadata-id u1))
    (ok metadata-id)
  )
)

(define-public (update-metadata (metadata-id uint) (diagnosis (string-ascii 100)) (phenotype (string-ascii 200)) (treatment-history (buff 32)) (metadata-hash (buff 32)))
  (let
    (
      (metadata (unwrap! (map-get? clinical-metadata { metadata-id: metadata-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set clinical-metadata
      { metadata-id: metadata-id }
      (merge metadata {
        diagnosis: diagnosis,
        phenotype: phenotype,
        treatment-history: treatment-history,
        metadata-hash: metadata-hash,
        updated-at: stacks-block-height
      })
    ))
  )
)
