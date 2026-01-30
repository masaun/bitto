(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map compliance-records
  { record-id: uint }
  {
    biobank-id: uint,
    regulation-type: (string-ascii 50),
    compliant: bool,
    certification-hash: (buff 32),
    auditor: principal,
    audit-date: uint,
    expiry-date: uint,
    notes: (string-ascii 200)
  }
)

(define-data-var record-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-compliance-record (record-id uint))
  (ok (map-get? compliance-records { record-id: record-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (record-compliance (biobank-id uint) (regulation-type (string-ascii 50)) (compliant bool) (certification-hash (buff 32)) (expiry-date uint) (notes (string-ascii 200)))
  (let
    (
      (record-id (var-get record-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? compliance-records { record-id: record-id })) ERR_ALREADY_EXISTS)
    (map-set compliance-records
      { record-id: record-id }
      {
        biobank-id: biobank-id,
        regulation-type: regulation-type,
        compliant: compliant,
        certification-hash: certification-hash,
        auditor: tx-sender,
        audit-date: stacks-block-height,
        expiry-date: expiry-date,
        notes: notes
      }
    )
    (var-set record-nonce (+ record-id u1))
    (ok record-id)
  )
)

(define-public (update-compliance-status (record-id uint) (compliant bool))
  (let
    (
      (record (unwrap! (map-get? compliance-records { record-id: record-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set compliance-records
      { record-id: record-id }
      (merge record { compliant: compliant })
    ))
  )
)
