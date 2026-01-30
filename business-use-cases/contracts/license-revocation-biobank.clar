(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map revocations
  { revocation-id: uint }
  {
    license-id: uint,
    licensee: principal,
    reason: (string-ascii 200),
    revoked-by: principal,
    revoked-at: uint,
    violation-hash: (buff 32)
  }
)

(define-data-var revocation-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-revocation (revocation-id uint))
  (ok (map-get? revocations { revocation-id: revocation-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (revoke-license (license-id uint) (licensee principal) (reason (string-ascii 200)) (violation-hash (buff 32)))
  (let
    (
      (revocation-id (var-get revocation-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? revocations { revocation-id: revocation-id })) ERR_ALREADY_EXISTS)
    (map-set revocations
      { revocation-id: revocation-id }
      {
        license-id: license-id,
        licensee: licensee,
        reason: reason,
        revoked-by: tx-sender,
        revoked-at: stacks-block-height,
        violation-hash: violation-hash
      }
    )
    (var-set revocation-nonce (+ revocation-id u1))
    (ok revocation-id)
  )
)
