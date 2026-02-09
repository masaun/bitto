(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map attestations uint {attester: principal, statement: (string-ascii 128), timestamp: uint, verified: bool})
(define-data-var attestation-nonce uint u0)

(define-public (submit-attestation (statement (string-ascii 128)))
  (let ((attestation-id (+ (var-get attestation-nonce) u1)))
    (map-set attestations attestation-id {attester: tx-sender, statement: statement, timestamp: stacks-block-height, verified: false})
    (var-set attestation-nonce attestation-id)
    (ok attestation-id)))

(define-read-only (get-attestation (attestation-id uint))
  (ok (map-get? attestations attestation-id)))
