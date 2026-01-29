(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var attestation-nonce uint u0)

(define-map attestations
  uint
  {
    work-id: uint,
    claimant: principal,
    evidence-hash: (buff 32),
    timestamp: uint,
    verified: bool
  }
)

(define-map work-attestations
  { work-id: uint, claimant: principal }
  uint
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-attestation (attestation-id uint))
  (ok (map-get? attestations attestation-id))
)

(define-read-only (get-work-attestation (work-id uint) (claimant principal))
  (ok (map-get? work-attestations { work-id: work-id, claimant: claimant }))
)

(define-read-only (get-attestation-nonce)
  (ok (var-get attestation-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (submit-attestation
  (work-id uint)
  (evidence-hash (buff 32))
)
  (let 
    (
      (attestation-id (+ (var-get attestation-nonce) u1))
      (existing (map-get? work-attestations { work-id: work-id, claimant: tx-sender }))
    )
    (asserts! (is-none existing) ERR_ALREADY_EXISTS)
    (map-set attestations attestation-id {
      work-id: work-id,
      claimant: tx-sender,
      evidence-hash: evidence-hash,
      timestamp: stacks-block-height,
      verified: false
    })
    (map-set work-attestations { work-id: work-id, claimant: tx-sender } attestation-id)
    (var-set attestation-nonce attestation-id)
    (ok attestation-id)
  )
)

(define-public (verify-attestation (attestation-id uint))
  (let ((attestation (unwrap! (map-get? attestations attestation-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set attestations attestation-id (merge attestation { verified: true })))
  )
)
