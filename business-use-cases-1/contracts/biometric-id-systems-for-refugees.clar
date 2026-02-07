(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map biometric-ids
  {bio-id: (string-ascii 128)}
  {
    individual: principal,
    fingerprint-hash: (buff 32),
    iris-hash: (buff 32),
    facial-hash: (buff 32),
    verified: bool,
    issued-by: principal,
    issued-at: uint,
    status: (string-ascii 16)
  }
)

(define-map id-verifications
  {verification-id: uint}
  {
    bio-id: (string-ascii 128),
    verifier: principal,
    verification-type: (string-ascii 64),
    timestamp: uint,
    result: bool
  }
)

(define-data-var verification-nonce uint u0)

(define-read-only (get-biometric-id (bio-id (string-ascii 128)))
  (map-get? biometric-ids {bio-id: bio-id})
)

(define-read-only (get-verification (verification-id uint))
  (map-get? id-verifications {verification-id: verification-id})
)

(define-public (register-biometric-id
  (bio-id (string-ascii 128))
  (individual principal)
  (fingerprint-hash (buff 32))
  (iris-hash (buff 32))
  (facial-hash (buff 32))
)
  (begin
    (ok (map-set biometric-ids {bio-id: bio-id}
      {
        individual: individual,
        fingerprint-hash: fingerprint-hash,
        iris-hash: iris-hash,
        facial-hash: facial-hash,
        verified: false,
        issued-by: tx-sender,
        issued-at: stacks-block-height,
        status: "pending"
      }
    ))
  )
)

(define-public (verify-biometric-id (bio-id (string-ascii 128)))
  (let ((bio (unwrap! (map-get? biometric-ids {bio-id: bio-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set biometric-ids {bio-id: bio-id}
      (merge bio {verified: true, status: "active"})
    ))
  )
)

(define-public (record-verification
  (bio-id (string-ascii 128))
  (verification-type (string-ascii 64))
  (result bool)
)
  (let (
    (bio (unwrap! (map-get? biometric-ids {bio-id: bio-id}) err-not-found))
    (verification-id (var-get verification-nonce))
  )
    (map-set id-verifications {verification-id: verification-id}
      {
        bio-id: bio-id,
        verifier: tx-sender,
        verification-type: verification-type,
        timestamp: stacks-block-height,
        result: result
      }
    )
    (var-set verification-nonce (+ verification-id u1))
    (ok verification-id)
  )
)
