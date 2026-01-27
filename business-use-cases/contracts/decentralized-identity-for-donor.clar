(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map donor-identities
  {donor-id: (string-ascii 128)}
  {
    entity: principal,
    entity-type: (string-ascii 32),
    verified: bool,
    kyc-hash: (buff 32),
    created-at: uint,
    total-donated: uint,
    reputation-score: uint
  }
)

(define-map donation-history
  {donation-id: uint}
  {
    donor-id: (string-ascii 128),
    amount: uint,
    program-id: (string-ascii 64),
    timestamp: uint,
    receipt-hash: (buff 32)
  }
)

(define-data-var donation-nonce uint u0)

(define-read-only (get-donor-identity (donor-id (string-ascii 128)))
  (map-get? donor-identities {donor-id: donor-id})
)

(define-read-only (get-donation (donation-id uint))
  (map-get? donation-history {donation-id: donation-id})
)

(define-public (register-donor
  (donor-id (string-ascii 128))
  (entity-type (string-ascii 32))
  (kyc-hash (buff 32))
)
  (begin
    (ok (map-set donor-identities {donor-id: donor-id}
      {
        entity: tx-sender,
        entity-type: entity-type,
        verified: false,
        kyc-hash: kyc-hash,
        created-at: stacks-block-height,
        total-donated: u0,
        reputation-score: u0
      }
    ))
  )
)

(define-public (verify-donor (donor-id (string-ascii 128)))
  (let ((donor (unwrap! (map-get? donor-identities {donor-id: donor-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set donor-identities {donor-id: donor-id}
      (merge donor {verified: true})
    ))
  )
)

(define-public (record-donation
  (donor-id (string-ascii 128))
  (amount uint)
  (program-id (string-ascii 64))
  (receipt-hash (buff 32))
)
  (let (
    (donor (unwrap! (map-get? donor-identities {donor-id: donor-id}) err-not-found))
    (donation-id (var-get donation-nonce))
  )
    (asserts! (is-eq tx-sender (get entity donor)) err-unauthorized)
    (asserts! (get verified donor) err-unauthorized)
    (map-set donation-history {donation-id: donation-id}
      {
        donor-id: donor-id,
        amount: amount,
        program-id: program-id,
        timestamp: stacks-block-height,
        receipt-hash: receipt-hash
      }
    )
    (map-set donor-identities {donor-id: donor-id}
      (merge donor {
        total-donated: (+ (get total-donated donor) amount),
        reputation-score: (+ (get reputation-score donor) u1)
      })
    )
    (var-set donation-nonce (+ donation-id u1))
    (ok donation-id)
  )
)
