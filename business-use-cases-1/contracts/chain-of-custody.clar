(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map custody-records
  { record-id: uint }
  {
    sample-id: uint,
    from-custodian: principal,
    to-custodian: principal,
    transfer-reason: (string-ascii 100),
    transfer-hash: (buff 32),
    timestamp: uint,
    location: (string-ascii 200)
  }
)

(define-data-var record-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-custody-record (record-id uint))
  (ok (map-get? custody-records { record-id: record-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (record-transfer (sample-id uint) (to-custodian principal) (transfer-reason (string-ascii 100)) (transfer-hash (buff 32)) (location (string-ascii 200)))
  (let
    (
      (record-id (var-get record-nonce))
    )
    (asserts! (is-none (map-get? custody-records { record-id: record-id })) ERR_ALREADY_EXISTS)
    (map-set custody-records
      { record-id: record-id }
      {
        sample-id: sample-id,
        from-custodian: tx-sender,
        to-custodian: to-custodian,
        transfer-reason: transfer-reason,
        transfer-hash: transfer-hash,
        timestamp: stacks-block-height,
        location: location
      }
    )
    (var-set record-nonce (+ record-id u1))
    (ok record-id)
  )
)
